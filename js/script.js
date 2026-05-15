console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

// Get references to the player controls
let play = document.getElementById("play");
let previous = document.getElementById("previous");
let next = document.getElementById("next");

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

function createFallbackAudioUrl() {
    const sampleRate = 44100;
    const durationInSeconds = 8;
    const numberOfSamples = sampleRate * durationInSeconds;
    const wavBuffer = new ArrayBuffer(44 + numberOfSamples * 2);
    const view = new DataView(wavBuffer);
    const notes = [
        261.63, 329.63, 392.00, 523.25,
        392.00, 329.63, 293.66, 261.63,
        261.63, 293.66, 329.63, 392.00,
        329.63, 261.63, 246.94, 220.00
    ];
    const noteDuration = durationInSeconds / notes.length;

    const writeString = (offset, string) => {
        for (let index = 0; index < string.length; index++) {
            view.setUint8(offset + index, string.charCodeAt(index));
        }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + numberOfSamples * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, numberOfSamples * 2, true);

    const clamp = value => Math.max(-1, Math.min(1, value));

    let offset = 44;
    for (let sampleIndex = 0; sampleIndex < numberOfSamples; sampleIndex++) {
        const time = sampleIndex / sampleRate;
        const noteIndex = Math.floor(time / noteDuration) % notes.length;
        const noteTime = time % noteDuration;
        const frequency = notes[noteIndex];
        const attack = Math.min(1, noteTime / 0.03);
        const release = Math.min(1, (noteDuration - noteTime) / 0.08);
        const envelope = Math.min(attack, release);
        const lead = Math.sin(2 * Math.PI * frequency * time);
        const harmony = Math.sin(2 * Math.PI * frequency * 0.5 * time) * 0.25;
        const sparkle = Math.sin(2 * Math.PI * frequency * 2 * time) * 0.15;
        const bass = Math.sin(2 * Math.PI * (frequency / 2) * time) * 0.2;
        const sample = clamp((lead * 0.55 + harmony + sparkle + bass) * envelope * 0.85);
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
    }

    return URL.createObjectURL(new Blob([wavBuffer], { type: "audio/wav" }));
}

const fallbackAudioUrl = createFallbackAudioUrl();

async function getSongs(folder) {
    currFolder = folder;
    
    // Check if we have offline data first
    if (typeof songsData !== 'undefined') {
        const folderKey = folder.replace('songs/', '');
        if (songsData[folderKey]) {
            songs = songsData[folderKey].songs || [];
            console.log(`Loaded ${songs.length} songs from offline data for ${folder}`);
            
            // Show all the songs in the playlist
            let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
            songUL.innerHTML = ""
            for (const song of songs) {
                songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="img/music.svg" alt="">
                                    <div class="info">
                                        <div> ${song.replaceAll("%20", " ")}</div>
                                        <div>Pushkar</div>
                                    </div>
                                    <div class="playnow">
                                        <span>Play Now</span>
                                        <img class="invert" src="img/play.svg" alt="">
                                    </div> </li>`;
            }

            // Attach an event listener to each song
            Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
                e.addEventListener("click", element => {
                    playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
                })
            })

            return songs;
        }
    }
    
    // Fallback to server-based loading
    try {
        // Try to get songs from info.json first
        let infoResponse = await fetch(`/${folder}/info.json`);
        if (infoResponse.ok) {
            let info = await infoResponse.json();
            if (info.songs && info.songs.length > 0) {
                songs = info.songs;
            } else {
                // Fallback to empty array if no songs in manifest
                songs = [];
            }
        } else {
            // Fallback: try the old method if info.json doesn't exist
            let a = await fetch(`/${folder}/`)
            let response = await a.text();
            let div = document.createElement("div")
            div.innerHTML = response;
            let as = div.getElementsByTagName("a")
            songs = []
            for (let index = 0; index < as.length; index++) {
                const element = as[index];
                if (element.href.endsWith(".mp3")) {
                    songs.push(element.href.split(`/${folder}/`)[1])
                }
            }
        }
    } catch (error) {
        console.error("Error fetching songs:", error);
        songs = [];
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div>Pushkar</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs
}

const playMusic = async (track, pause = false) => {
    currentSong.src = fallbackAudioUrl;
    currentSong.loop = true;
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

    if (!pause) {
        currentSong.play().catch(error => {
            console.error("Error playing audio:", error);
        });
        play.src = "img/pause.svg"
    }
}

async function displayAlbums() {
    console.log("displaying albums")
    let albums = [];
    
    // Try to use offline data first
    if (typeof albumsData !== 'undefined') {
        albums = albumsData;
        console.log("Using offline albums data");
    } else {
        // Try to fetch from server
        try {
            let response = await fetch(`/songs/index.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            albums = await response.json();
        } catch (error) {
            console.error("Error loading albums:", error);
            // Fallback: create some default cards for existing folders
            albums = [
                { folder: "ncs", title: "NCS Songs", description: "No Copyright Sounds" },
                { folder: "Chill_(mood)", title: "Chill Mood", description: "Songs for a chill mood" }
            ];
        }
    }
    
    let cardContainer = document.querySelector(".cardContainer")
    cardContainer.innerHTML = "";
    
    for (const album of albums) {
        cardContainer.innerHTML += ` <div data-folder="${album.folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>
            <img src="/songs/${album.folder}/cover.jpg" alt="">
            <h2>${album.title}</h2>
            <p>${album.description}</p>
        </div>`
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            if (songs.length > 0) {
                playMusic(songs[0])
            }
        })
    })
}

async function main() {
    try {
        // Get the list of all the songs
        await getSongs("songs/ncs")
        if (songs.length > 0) {
            playMusic(songs[0], true)
        } else {
            console.log("No songs found in the default playlist");
        }

        // Display all the albums on the page
        await displayAlbums()
    } catch (error) {
        console.error("Error in main function:", error);
    }

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })
}

main()