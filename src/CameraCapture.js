// CameraCapture.jsx

import React, { useEffect, useState } from 'react';

const CameraCapture = ({ snap, setSnap }) => {
    const [recording, setRecording] = useState(false);
    const [mr, setMr] = useState(null);

    const [once, setOnce] = useState(false)
    let video = document.getElementById('video');
    let canvas = document.getElementById('canvas');
    let photo = document.getElementById('photo');
    let recordedChunks = [];
    let mediaRecorder;
    const startRecording = async () => {
        try {
            const videoStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            });
            const microphoneStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            // if (condition) {

            // }
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(microphoneStream);
            // const str = audioContext.createMediaStreamDestination();

            const lowpassFilter = audioContext.createBiquadFilter();
            lowpassFilter.type = "lowpass";
            lowpassFilter.frequency.value = 200; // Adjust cutoff frequency as needed

            // Highpass filter (remove frequencies above 3000Hz)
            const highpassFilter = audioContext.createBiquadFilter();
            highpassFilter.type = "highpass";
            highpassFilter.frequency.value = 3000; // Adjust cutoff frequency as needed
            lowpassFilter.connect(highpassFilter);
            source.connect(highpassFilter);
            const audioStream = source.mediaStream;
            // Create a new MediaStream containing tracks from both video and processed audio streams
            const combinedStream = new MediaStream([
                ...videoStream.getVideoTracks(),
                ...audioStream.getAudioTracks(),
            ]);

            // Create the MediaRecorder with the combined stream
            mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType: "video/webm;",
            })

            // Set up event listeners for the recorder
            mediaRecorder.ondataavailable = (event) => {
                recordedChunks.push(event.data);
                console.log(mediaRecorder)
            };

            mediaRecorder.onstop = () => {
                // Combine recorded chunks into a single blob
                const blob = new Blob(recordedChunks, { type: "video/mp4" });

                // Create a URL for the blob and initiate the download
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = url;
                a.download = "screen-recording.mp4";
                a.click();

                // Clean up resources
                URL.revokeObjectURL(url);
                recordedChunks = [];
                if (audioStream) {
                    audioStream.getTracks().forEach((track) => track.stop());
                }

                // Stop the screen capture track
                const videoTrack = videoStream.getVideoTracks()[0];
                videoTrack.stop();
            };


            mediaRecorder.start();
            setMr(mediaRecorder)

            video = document.getElementById('video');
            video.srcObject = combinedStream;
            video.style.display = 'block';
            video.play();
            video.addEventListener(
                "canplay",
                (ev) => {
                    canvas = document.getElementById('canvas');
                    canvas.setAttribute("width", video.videoWidth);
                    canvas.setAttribute("height", video.videoHeight);
                },
                false,
            );
        } catch (error) {
            console.error('Error accessing screen:', error);
        }
    };

    const stopRecording = () => {
        if (mr && mr.state !== 'inactive') {
            mr.stop();
        }
    };

    const toggleRecording = () => {
        setRecording((prevRecording) => !prevRecording);

        if (!recording) {
            startRecording();
        } else {
            stopRecording();
        }
    };
    function clearPhoto() {
        canvas = document.getElementById('canvas');
        photo = document.getElementById('photo');
        const context = canvas.getContext("2d");

        context.fillStyle = "#AAA";
        context.fillRect(0, 0, canvas.width, canvas.height);

        const data = canvas.toDataURL("image/png");
        photo.setAttribute("src", data);
    }

    function takePicture() {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photo = document.getElementById('photo');
        const context = canvas.getContext("2d");
        let height = canvas.height;
        let width = canvas.width;
        if (width && height) {
            if (!once) {
                // context.translate(width, 0);
                // context.scale(-1, 1);
                setOnce(true)
            }
            context.drawImage(video, 0, 0, width, height);

            const data = canvas.toDataURL("image/png");
            photo.setAttribute("src", data);
        } else {
            clearPhoto();
        }
    }
    useEffect(() => {
        if (snap) {
            takePicture()
            setSnap(false)
        }
    }, [snap])

    //WebkitTransform: 'scaleX(-1)', transform: 'scaleX(-1)' 
    return (
        <div >
            <video id="video" autoPlay muted playsInline style={{ display: "none" }}></video>
            <canvas id="canvas" style={{ display: 'none' }}> </canvas>
            <div className="output" style={{ marginTop: '5%' }}>
                <img id="photo" alt="The screen capture will appear in this box." />
            </div>
            <button onClick={toggleRecording}>
                {recording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <button onClick={takePicture}>Take Picture</button>
        </div>
    );
};

export default CameraCapture;
