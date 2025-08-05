// Songs data for local development without server
const songsData = {
    "ncs": {
        title: "Sleep Songs",
        description: "Songs for you",
        songs: ["chill-vibes.mp3", "sample-song-1.mp3", "sample-song-2.mp3"]
    },
    "Chill_(mood)": {
        title: "Just Chill",
        description: "Yes, Just Chill",
        songs: ["peaceful-melody.mp3", "relaxing-tune.mp3"]
    },
    "Angry_(mood)": {
        title: "Angry Mood",
        description: "Songs for an angry mood",
        songs: []
    },
    "Bright_(mood)": {
        title: "Bright Mood", 
        description: "Songs for a bright mood",
        songs: []
    },
    "Dark_(mood)": {
        title: "Dark Mood",
        description: "Songs for a dark mood", 
        songs: []
    },
    "Diljit": {
        title: "Diljit Playlist",
        description: "Songs by Diljit",
        songs: []
    },
    "Funky_(mood)": {
        title: "Funky Mood",
        description: "Songs for a funky mood",
        songs: []
    },
    "karan aujla": {
        title: "Karan Aujla Playlist", 
        description: "Songs by Karan Aujla",
        songs: []
    },
    "Love_(mood)": {
        title: "Love Mood",
        description: "Songs for a loving mood",
        songs: []
    },
    "cs": {
        title: "CS Playlist",
        description: "Songs for coding sessions", 
        songs: []
    },
    "Uplifting_(mood)": {
        title: "Uplifting Mood",
        description: "Songs for an uplifting mood",
        songs: []
    }
};

// Albums array for easy access
const albumsData = Object.keys(songsData).map(folder => ({
    folder: folder,
    title: songsData[folder].title,
    description: songsData[folder].description
}));
