import mongoose, {Schema} from "mongoose"

const playlistSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true // for searching
    },
    description: {
        type: String,
        required: true,
        trim: true,
        index: true // for searching
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true});

export const Playlist = mongoose.Schema("Playlist", playlistSchema);