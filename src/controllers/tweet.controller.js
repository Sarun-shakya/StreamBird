import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.models.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized");
    }

    //create tweet
    const createdTweet = await Tweet.create({
        content: content.trim(),
        owner: req.user?._id
    })

    if (!createdTweet) {
        throw new ApiError(400, "Failed to create a tweet");
    }

    res
        .status(201)
        .json(
            new ApiResponse(201, createdTweet, "Tweet Posted Successfully")
        )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const extractedTweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 });

    if (extractedTweets.length === 0) {
        return res
            .status(200)
            .json({ message: "No tweets found" })
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, extractedTweets, "User tweets retrieved successfully")
        )
})

const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { tweetId } = req.params;

    if (!content) {
        throw new ApiError(400, "Content is required to update");
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweetId");
    }

    const tweet = await Tweet.findById(tweetId);

    if(!tweet){
        throw new ApiError(400, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    const newTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        { new: true }
    )

    if (!newTweet) {
        throw new ApiError(400, "Faield to update tweet");
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, newTweet, "Tweet updated successfully")
        )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid twetId");
    }

    const tweet = await Tweet.findById(tweetId);

    if(!tweet){
        throw new ApiError(400, "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "You are not authorized to delete this tweet");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deletedTweet) {
        throw new ApiError(404, "Failed to delete tweet");
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, deletedTweet, "Tweet deleted successfully")
        )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}