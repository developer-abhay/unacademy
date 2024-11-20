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
    // const [socket, setSocket] = useState<WebSocket>()
    const socketRef = useRef<WebSocket | null>(null)


    // open media devices (ask for user permissions)
    const openMediaDevices = async (constraints: Constraints) => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Your browser does not support WebRTC.');
            return
        }
        return await navigator.mediaDevices.getUserMedia(constraints);
    }

    // Local Streaming
    const getLocalStream = async () => {
        try {
            localStreamRef.current = await openMediaDevices({ 'video': true, 'audio': true });

            console.log('Got MediaStream:', localStreamRef.current);

            const videoElement = document.querySelector('video#localVideo') as HTMLVideoElement;
            if (videoElement && localStreamRef.current) {
                videoElement.srcObject = localStreamRef.current;
            }

            return;

        } catch (error: unknown) {
            console.error('Error accessing media devices.', error);
        }
    }

    // Create WS connection
    const wsConnection = () => {
        if (!socketRef.current) {
            socketRef.current = new WebSocket('ws://localhost:8080');

            // socket on open
            socketRef.current.onopen = () => {
                console.log('Conneciton made with the server')

            }

            // socket on message
            socketRef.current.onmessage = async (message) => {

                const data = JSON.parse(await message.data.text());
                console.log(data);

                if (data.type == 'offer' && peerConnection.current) {
                    console.log('offer recieved')
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data));
                    const answer = await peerConnection.current.createAnswer();
                    await peerConnection.current.setLocalDescription(answer);
                    socketRef.current!.send(JSON.stringify(answer));
                } else if (data.type == 'answer' && peerConnection.current) {
                    console.log('answer')
                    console.log(peerConnection.current.signalingState);
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data));
                } else if (data.candidate && peerConnection.current) {
                    console.log('candidate')
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(data));
                }
            }

            // socket on close
            socketRef.current.onclose = () => {
                const videoElement = document.querySelector('video#localVideo') as HTMLVideoElement;
                if (videoElement) videoElement.srcObject = null;

                const remoteVideoElement = document.querySelector('video#remoteVideo') as HTMLVideoElement;
                if (remoteVideoElement) remoteVideoElement.srcObject = null;

                console.log("WebSocket closed");
                // setTimeout(wsConnection, 2000); // Reconnect after 2 seconds
            };


        }
    }

    // Set peer connection
    const setPeerCOnnection = async () => {
        const remoteVideo = document.querySelector('video#remoteVideo') as HTMLVideoElement;

        const configuration = {
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        };
        peerConnection.current = new RTCPeerConnection(configuration);

        if (localStreamRef.current) {
            console.log('true')
            localStreamRef.current.getTracks().forEach(track => peerConnection.current?.addTrack(track, localStreamRef.current as MediaStream));
        }

        peerConnection.current.ontrack = (event) => {
            console.log('tracked')
            // Add remote tracks to the remoteStream
            if (!remoteStreamRef.current) {
                remoteStreamRef.current = new MediaStream();
                remoteVideo.srcObject = remoteStreamRef.current;
            }
            remoteStreamRef.current.addTrack(event.track);
        };

        peerConnection.current.onicecandidate = (event) => {
            console.log('ice canditate')
            if (event.candidate) {
                // Send the candidate to the remote peer through signaling
                if (socketRef.current) {
                    socketRef.current.send(JSON.stringify(event.candidate));
                }
            }
        };
    }

    // handle click 
    const handleClick = async () => {
        console.log('button clicked')
        if (peerConnection.current) {
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            if (socketRef.current) {
                console.log('data sent')
                console.log(offer)
                socketRef.current.send(JSON.stringify(offer));
            }
        }
    }

    useEffect(() => {
        getLocalStream().then(() => {
            wsConnection();
            setPeerCOnnection()
        });



        // return () => {
        //     if (socketRef.current) {
        //         socketRef.current.close();
        //     }
        //     peerConnection.current?.close();
        //     localStreamRef.current?.getTracks().forEach(track => track.stop());
        // };
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
