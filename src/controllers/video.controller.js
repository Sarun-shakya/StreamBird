import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {

    const { title, description} = req.body
    
    if (!title || !description || title.trim() === "" || description.trim() === "") {
        throw new ApiError(400, "All fields are required");
    }

    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if(!videoLocalPath){
        throw new ApiError(400, "VideoLocalPath is required");
    }

    if(!thumbnailLocalPath){
        throw new ApiError(400, "ThumbnailLocalPath is required");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!videoFile){
        throw new ApiError(400, "Video file is required");
    }

    if(!thumbnail){
        throw new ApiError(400, "Thumbnail file is required");
    }

    const video = await Video.create({
        title,
        description,
        videoFile : {
            url: videoFile.url,
            public_id: videoFile.public_id
        },
        thumbnail: {
            url: thumbnail.url,
            public_id: thumbnail.public_id
        },
        duration: videoFile.duration,
        isPublished: false,
        owner: req.user
    });

    if(!video){
        throw new ApiError(400, "Video Failed to upload");
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video uploaded successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Object Id is not valid");
    }

    const videoFile = Video.findById(videoId);

    if(!videoFile){
        throw new ApiError(400, "Video file not found");
    }

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Object Id is not valid");
    }

    const videoFile =  await Video.findById(videoId);

    if(!videoFile){
        throw new ApiError(404, "Video file not found");
    }

    if(videoFile?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "You can't delete this video as you're not a owner");
    }

    const deletedVideo = await  Video.findByIdAndDelete(videoFile?._id);

    if(!deletedVideo){
        throw new ApiError(404, "Failed to delete video");
    }

    console.log("VIDEO FILE:", videoFile);

    await deleteOnCloudinary(videoFile.thumbnail.public_id);
    await deleteOnCloudinary(videoFile.videoFile.public_id, "video");

    res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Video deleted successfully")
    )
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}