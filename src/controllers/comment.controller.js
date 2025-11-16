import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.models.js"
import { Video } from "../models/video.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a videoy
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video Id is not valid");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required");
    }

    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "Video not found");
    }

    const newComment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if (!newComment) {
        throw new ApiError(400, "Failed to add comment");
    }

    res
        .status(201)
        .json(
            new ApiResponse(201, newComment, "Comment added Successfully ")
        )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    const { content } = req.body;

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Not a valid commentId");
    }

    if(!content){
        throw new ApiError(400, "Content is required");
    }

    const comment = await Comment.findById(commemtId);

    if(!comment){
        throw new ApiError("Comment not found");
    }

    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
            commemtId,
            {
                $set: {
                    content
                }
            },
            {new: true}
    )

    if(!updatedComment){
        throw new ApiError(400, "Failed to update comment");
    }

    res 
        .status(200)
        .json(
            new ApiResponse(200, updatedComment, "Commnt updated successfully")
        );

})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Comment Id is not valid");
    }

    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(400, "Comment not found");
    }

    if(comment.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "You are not authorized to delete this comment");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if(!deletedComment){
        throw new ApiError(400, "Failed to delete comment");
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, deletedComment, "Comment deleted successfully")
        );
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}