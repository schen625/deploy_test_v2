import uitoolkit, { CustomizationOptions } from "@zoom/videosdk-ui-toolkit";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";
import "./App.css";

function App() {
  let sessionContainer: HTMLDivElement | null = null;
  // set your auth endpoint here
  // a sample is available here: https://github.com/zoom/videosdk-auth-endpoint-sample
  const authEndpoint = "https://deploy-test-backend-3f10.onrender.com"; // http://localhost:4000
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
    console.log(config);
    if (sessionContainer) {
      uitoolkit.joinSession(sessionContainer, config); 
      sessionContainer && uitoolkit.onSessionClosed(sessionClosed);
      uitoolkit.onSessionDestroyed(sessionDestroyed);
    }
  }

  const sessionClosed = () => {
    console.log("session closed");
    document.getElementById("join-flow")!.style.display = "block";
  };

  const sessionDestroyed = () => {
    console.log("session destroyed");
    uitoolkit.destroy();
  };

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
      </main>
    </div>
  );
}

export default App;

