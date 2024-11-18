"use client"
import React, { useEffect, useRef, useState } from 'react'

interface Constraints {
    'video': boolean;
    'audio': boolean
}

const Video = () => {
    const localStreamRef = useRef<MediaStream>();
    const remoteStreamRef = useRef<MediaStream>();
    const peerConnection = useRef<RTCPeerConnection | null>();
    const [socket, setSocket] = useState<WebSocket>()


    // open media devices (ask for user permissions)
    const openMediaDevices = async (constraints: Constraints) => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Your browser does not support WebRTC.');
        }
        return await navigator.mediaDevices.getUserMedia(constraints);
    }

    // Local Streaming
    const getLocalStream = async () => {
        try {
            localStreamRef.current = await openMediaDevices({ 'video': true, 'audio': true });

            console.log('Got MediaStream:', localStreamRef.current);

            const videoElement = document.querySelector('video#localVideo') as HTMLVideoElement;
            if (videoElement) {
                videoElement.srcObject = localStreamRef.current;
            }

        } catch (error: unknown) {
            console.error('Error accessing media devices.', error);
        }
    }

    // Create WS connection
    const wsConnection = () => {
        const socket = new WebSocket('http://localhost:8080');

        socket.onopen = () => {
            console.log('Conneciton made with the server')
        }

        socket.onmessage = async (message) => {
            const reader = await new Response(message.data).text();
            const data = JSON.parse(reader);
            console.log(data);
            // const data = JSON.parse(message.data)

            if (data.offer) {
                await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await peerConnection.current?.createAnswer();
                await peerConnection.current?.setLocalDescription(answer);
                socket.send(JSON.stringify({ answer }));
            } else if (data.answer) {
                await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
            } else if (data.candidate) {
                await peerConnection.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        }

        setSocket(socket)
    }

    // handle click 
    const handleClick = async () => {
        // const button = document.getElementById('startCall')

        // button.addEventListener('click', async () => {
        console.log('button clickevd')
        const offer = await peerConnection.current?.createOffer();
        await peerConnection.current?.setLocalDescription(offer);
        if (socket) {
            socket.send(JSON.stringify({ offer }));
        }
        // });
    }

    useEffect(() => {
        const remoteVideo = document.querySelector('video#remoteVideo') as HTMLVideoElement;

        getLocalStream();
        wsConnection()
        try {
            const configuration = {
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            };
            peerConnection.current = new RTCPeerConnection(configuration);

            localStreamRef.current?.getTracks().forEach(track => peerConnection.current?.addTrack(track, localStreamRef.current!));

            peerConnection.current.ontrack = (event) => {
                // Add remote tracks to the remoteStream
                if (!remoteStreamRef.current) {
                    remoteStreamRef.current = new MediaStream();
                    remoteVideo.srcObject = remoteStreamRef.current;
                }
                remoteStreamRef.current.addTrack(event.track);
            };

            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    // Send the candidate to the remote peer through signaling
                    if (socket) {
                        socket.send(JSON.stringify({ candidate: event.candidate }));
                    }
                }
            };

        } catch (error) {

        }
    }, [])




    return (
        <div>
            <button id='startCall' onClick={handleClick}>Start Call</button>
            <video id="localVideo" autoPlay playsInline muted controls={false} />
            <video id="remoteVideo" autoPlay playsInline controls={false} />
        </div>
    )
}

export default Video
