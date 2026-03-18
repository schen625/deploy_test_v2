import uitoolkit, { CustomizationOptions } from "@zoom/videosdk-ui-toolkit";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";
import "./App.css";
import { useState } from "react";



function App() {


  const [captions, setCaptions] = useState("");
  let sessionContainer: HTMLDivElement | null = null;
  // set your auth endpoint here
  // a sample is available here: https://github.com/zoom/videosdk-auth-endpoint-sample
  const authEndpoint = "http://localhost:4000";; // http://localhost:4000
  const config: CustomizationOptions = {
    videoSDKJWT: "",
    sessionName: "test",
    userName: "Host",
    sessionPasscode: "123",
    featuresOptions: {
      preview: {
        enable: true,
      },
      phone: {
        enable: false,
      },
      subsession: {
        enable: false,
      },
      virtualBackground: {
        enable: true,
        virtualBackgrounds: [
          {
            url: "https://images.unsplash.com/photo-1715490187538-30a365fa05bd?q=80&w=1945&auto=format&fit=crop",
          },
        ],
      },
    },
  };

  function getVideoSDKJWT(role:number, userName:string) {
    sessionContainer = document.getElementById(
      "sessionContainer"
    ) as HTMLDivElement;
    document.getElementById("join-flow")!.style.display = "none";
    fetch(authEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionName: "test",
        role: role,
        userName: userName,
        videoWebRtcMode: 1,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.signature) {
          console.log(data.signature);
          config.videoSDKJWT = data.signature;
          config.userName = userName;
          joinSession();
        } else {
          console.log(data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function joinSession() {
    if (sessionContainer) {
      uitoolkit.joinSession(sessionContainer, config);
      startGoogleCaptions();   // 👈 ADD THIS
      sessionContainer && uitoolkit.onSessionClosed(sessionClosed);
      uitoolkit.onSessionDestroyed(sessionDestroyed);
    }
  }

  const sessionClosed = () => {
    stopGoogleCaptions();
    document.getElementById("join-flow")!.style.display = "block";
  };

  const sessionDestroyed = () => {
    console.log("session destroyed");
    uitoolkit.destroy();
  };

  async function sendAudioToFlask(blob: Blob) {
    console.log("Uploading to Flask...");

    const formData = new FormData();
    formData.append("audio", blob, "audio.webm");
    formData.append("target_lang", "es");

    const res = await fetch("http://127.0.0.1:5000/api/transcribe_translate", {
      method: "POST",
      body: formData
    });

    console.log("Response status:", res.status);

    const data = await res.json();
    console.log("Flask response:", data);

    if (data.translated) {
      setCaptions(prev => prev + " " + data.translated);
    }
  }

  let mediaRecorder: MediaRecorder | null = null;

  let recordedChunks: Blob[] = [];

  async function startGoogleCaptions() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm"
    });

    recordedChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: "audio/webm" });
      console.log("Sending full recording");
      await sendAudioToFlask(blob);
    };

    mediaRecorder.start();
  }


  

  function stopGoogleCaptions() {
    mediaRecorder?.stop();
  }

  return (
    <div className="App">
      <main>
        <div id="join-flow">
          <h1>Zoom Video SDK Sample React</h1>
          <p>User interface offered by the Video SDK UI Toolkit</p>
          <div id="meeting-button">
          <button onClick={()=>getVideoSDKJWT(1, "Host")}>Start New Meeting</button>
          <button onClick={()=>getVideoSDKJWT(0, "Guest")}>Join Existing Session</button>
          </div>
          
        </div>
        <div id="sessionContainer"></div>

        <div style={{
          background: "black",
          color: "white",
          padding: "10px",
          marginTop: "10px"
        }}>
          {captions}
        </div>

        <button
          style={{ marginTop: "10px" }}
          onClick={stopGoogleCaptions}
        >
          Stop & Transcribe
        </button>
      </main>
    </div>
  );
}

export default App;
