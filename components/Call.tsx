'use client'

import {
  AgoraRTCProvider,
  LocalVideoTrack,
  RemoteUser,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRTCClient,
  useRemoteAudioTracks,
  useRemoteUsers
} from "agora-rtc-react";
import AgoraRTC from "agora-rtc-sdk-ng";

function Call(props: { appId: string, channelName: string }) {
  const client = useRTCClient(AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }));

  return (
    <AgoraRTCProvider client={client}>
      <Videos channelName={props.channelName} AppID={props.appId} />
      <div className="fixed z-10 bottom-0 left-0 right-0 flex justify-center pb-4">
        <a className="px-5 py-3 text-base font-medium text-center text-white bg-red-400 rounded-lg hover:bg-red-500 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 w-40" href="/">End Call</a>
      </div>
    </AgoraRTCProvider>
  );
}

function Videos(props: { channelName: string; AppID: string; }) {
  const { AppID, channelName } = props;
  const { isLoading: isLoadingMic, localMicrophoneTrack } = useLocalMicrophoneTrack();
  const { isLoading: isLoadingCam, localCameraTrack } = useLocalCameraTrack();
  const remoteUsers = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);

  usePublish([localMicrophoneTrack, localCameraTrack]);
  useJoin({
    appid: AppID,
    channel: channelName,
    token: null,
  });

  audioTracks.map((track) => track.play());
  const deviceLoading = isLoadingMic || isLoadingCam;
  if (deviceLoading) return <div className="flex flex-col items-center pt-40">Loading devices...</div>;

  const numUsers = remoteUsers.length + 1;
  let numCols = 1;
  let numRows = 1;
  switch (numUsers) {
    case 1:
      numCols = 1;
      numRows = 1;
      break;
    case 2:
      numCols = 2;
      numRows = 1;
      break;
    case 3:
      numCols = 3;
      numRows = 1;
      break;
    case 4:
      numCols = 2;
      numRows = 2;
      break;
    default:
      break;
  }

  return (
    <div className="flex flex-col justify-between w-full h-screen p-1">
      <div className={`grid grid-cols-${numCols} grid-rows-${numRows} gap-1 flex-1`}>
        <LocalVideoTrack track={localCameraTrack} play={true} className="w-full h-full" />
        {remoteUsers.map((user) => (
          <RemoteUser user={user} />
        ))}

      </div>
    </div>
  );
}


export default Call;