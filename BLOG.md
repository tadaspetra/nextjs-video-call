# Build a NextJS Video Call App

Video calling has become an essential feature in today's digital landscape. Whether it's for remote work, online education, or staying connected with loved ones, the ability to communicate face-to-face over the internet is crucial. As a developer, you might be looking for a reliable solution to integrate video calling into your NextJS application. Look no further! In this article, we will explore how to implement a video call feature using the Agora React SDK.

## What We Will Use
Of course, we need the NextJS framework, since it is the topic of this article. 

We will use Agora for the video call portion of the app. Specifically, we will use the `agora-rtc-react` package. This package is a React SDK for interfacing with [Agora](https://docs.agora.io/en/video-calling/get-started/get-started-sdk?platform=react-js).

We will use Tailwind CSS for minor styling of the application.

## Create an Agora Account
[Sign up](https://sso2.agora.io/en/v7/signup) for an Agora account, and log in to the dashboard.

Navigate to the Project List tab under the Project Management tab. Create a project by clicking the blue Create button.

Retrieve the App ID, which we’ll use to authorize the app requests as we develop the application.

## Initialize the NextJS Project
1. Create your NextJS project by using `npx create-next-app@latest`. 
2. Add Tailwind CSS when prompted by the NextJS installer.
4. Add the Agora UI Kit by using `npm install agora-rtc-react`.
5. Add `PUBLIC_AGORA_APP_ID = '<---Your App Id--->'` to your `.env` file.

## Structure of the Project 
```
├── components
│   └── Call.tsx
├── app
|   └── Layout.tsx
│   └── page.tsx
│   └── channel
│       └── [channelName]
│           └── page.tsx
├── public
│   └── favicon.png
├── package.json
├── next.config.js
├── tsconfig.json
└── tailwing.config.cjs
```


## Building a Form with NextJS

### 'use client'
The form we want to build is a very simple form, where we take the input from the user and route the user to the `channel/<form input here>` route of the website. 

This needs to happen client side because you are receiving the input from the user, and based on that input send them to a new route. For that we will use the `useRouter` hook from `next/navigation`. And to use it client side we have to add `'use client'` at the top of our file.

### Form UI
The next step is creating the UI for the form input. For this, we create a form element with an input element named "channel". 

All the magic happens in the form's `onSubmit` method where we have access to the data(`e`) from the submit action. Whenever a form is submitted, the default action is to reload the page, however, since we want to lead a user to a new page we want to manually handle this action. Using `e.preventDefault()` we can stop the page refresh. 

The next step is to reroute the page to the appropriate channel page. We first define a variable called `target` which asserts that we have a "channel" value in our form event. 

And lastly using the router we imported from `next/navigation` we can route this page to `/channel/<inputted channel name>`

```tsx
<div className="flex flex-col items-center">
  <h1
    className="mb-4 mt-20 text-4xl font-extrabold leading-none tracking-tight text-gray-900"
  >
    <span className="text-black">NextJS</span> x <span className="text-blue-500"
    >Agora</span
    >
  </h1>
  <form onSubmit={(e) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      channel: { value: string }
    };
    router.push(`/channel/${target.channel.value}`)
  }}>
    <div className="md:flex md:items-center mt-6">
      <div>
        <label
          className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
          htmlFor="inline-full-name"
        >
          Channel Name
        </label>
      </div>
      <div>
        <input
          className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
          id="inline-full-name"
          type="text"
          name="channel"
          placeholder="Enter channel name"
          required
        />
      </div>
    </div>
    <div className="text-center">
      <button
        className="inline-flex items-center justify-center px-5 py-3 mt-5 text-base font-medium text-center text-white bg-blue-400 rounded-lg hover:bg-blue-500 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
      >Submit</button
      >
    </div>
  </form>
</div>
```

Our form should look like this:
![Enter Channel](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/hifrer897jsqfsacufad.png)



## Call Page
In the Call component that we will build with the `agora-rtc-react`, we want to print the name of the channel we have joined.

The redirect we used in the previous section is dynamic, and it will be different depending on the channelName we entered. To handle this in Next, we need to create a `channel` folder and a `[channelName]` folder within and lastly a `page.tsx` file. The square brackets signify that the dynamic channel name in our URL will be passed as a parameter in this component. We just need to retrieve the channel name and display it in our UI.

So we retrieve the channel name from our params, and display it in the top left of our screen above the video call component. 

```tsx
import Call from "@/components/Call";

export default function Page({ params }: { params: { channelName: string } }) {
    return (
        <main className="flex w-full flex-col">
            <p className="absolute z-10 mt-2 ml-12 text-2xl font-bold text-gray-900">
                {params.channelName!}
            </p>
            <Call appId={process.env.PUBLIC_AGORA_APP_ID!} channelName={params.channelName}></Call>
        </main>
    )
}
```

## Add the Call Component
The Call component will contain two key components:
* Videos of all the participants
* End call button

The interesting part is displaying the videos of all the participants. To do that we need to create our Agora client and pass it to the `AgoraRTCProvider`, which initializes and gives us access to the Agora RTC service. Inside this, we can now display the videos component and an end-call button:

```tsx
"use client" 

import AgoraRTC, {
  AgoraRTCProvider,
  LocalVideoTrack,
  RemoteUser,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRTCClient,
  useRemoteAudioTracks,
  useRemoteUsers,
} from "agora-rtc-react";

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
```

### Videos
The Videos component will be the part of the site that displays the videos of all the participants. Many hooks are used to set up the call:
* useLocalMicrophoneTrack() retrieves the current user's microphone.
* useLocalCameraTrack() retrieves the current user's video input.
* useRemoteUsers() retrieves all the user information for the remote users.
* useRemoteAudioTracks() retrieves the audio for those users.
* usePublish() publishes the current user's video and audio.
* useJoin() joins the channel for the video call.

```tsx
const { AppID, channelName } = props;
const { isLoading: isLoadingMic, localMicrophoneTrack } = useLocalMicrophoneTrack();
const { isLoading: isLoadingCam, localCameraTrack } = useLocalCameraTrack();
const remoteUsers  = useRemoteUsers();
const { audioTracks } = useRemoteAudioTracks(remoteUsers);

usePublish([localMicrophoneTrack, localCameraTrack]);
useJoin({
	appid: AppID,
	channel: channelName,
	token:  null ,
});
```

Then we need to make sure all the audio for the remote users is started:

```tsx
audioTracks.map((track) => track.play());
```

Finally, we need to define our UI: first a loading state, while we wait for the local user's microphone and video to begin, and then a grid of all the users who are on the call:

```tsx
const deviceLoading = isLoadingMic || isLoadingCam;
if (deviceLoading) return <div className="flex flex-col items-center pt-40">Loading devices...</div>;
const unit = 'minmax(0, 1fr) ';

return (
  <div className="flex flex-col justify-between w-full h-screen p-1">
    <div className={`grid  gap-1 flex-1`} style={{
      gridTemplateColumns:
        remoteUsers.length > 9
          ? unit.repeat(4)
          : remoteUsers.length > 4
            ? unit.repeat(3)
            : remoteUsers.length > 1
              ? unit.repeat(2)
              : unit
    }}>
      <LocalVideoTrack track={localCameraTrack} play={true} className="w-full h-full" />
      {remoteUsers.map((user) => (
        <RemoteUser user={user} />
      ))}

    </div>
  </div>
);
```

Our final video call should look like this:
![Video Call](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/toidmib42ycml33600i6.png)



## Summary
With that, we have a complete video call experience. Here's how we built it:

1. Create our NextJS project with Tailwind.
2. Install the Agora SDK.
3. Create a form to input the channel name.
4. Redirect the site to a URL with the channel name.
5. Display the channel name with a video call.

The code for this project can be found [here](https://github.com/tadaspetra/nextjs-video-call). You can find out more about Agora video calling [here](https://docs.agora.io/en/video-calling/get-started/get-started-sdk?platform=react-js).

Thank you for reading!