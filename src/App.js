import React, { useState, useEffect } from "react";
import Olama from "./Olama";
import CameraCapture from "./CameraCapture";
import SpeechSynthesis from "./SpeechSynthesis";

//------------------------SPEECH RECOGNITION-----------------------------

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "en-US";

//------------------------COMPONENT-----------------------------

const Speech = () => {
  const [listening, setListening] = useState(false);


  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [question, setQuestion] = useState(false)
  const [snap, setSnap] = useState(false)
  const [ask, setAsk] = useState("")
  const [text, setText] = useState("");
  const [start, setStart] = useState(false);




  // useEffect(() => {
  //   if (question) {
  //     //setQuestion((prevQuestion) => !prevQuestion);
  //     console.log('send')
  //   }

  // }, [question])



  const toggleListen = () => {
    setListening((prevListening) => !prevListening);

    if (!listening) {
      setText('yes boss')
      setStart(true)
      recognition.start();
    } else {
      recognition.stop();
    }
  };



  const send = () => {
    Olama.chat(ask).then((response) => {
      console.log(response.done);
      setText(response.message.content)
      setStart(true)
    }).catch((err) => {
      console.log(err)
    })
  }
  useEffect(() => {
    const handleRecognitionStart = () => {

      console.log("Listening!");
    };

    const handleRecognitionEnd = () => {

      if (listening) {

        recognition.start();
        console.log("...continue listening...");
      } else {
        setFinalTranscript("")
        setInterimTranscript("")
        console.log("Stopped listening per click");
      }

    };

    const handleRecognitionResult = (event) => {
      let interim = "";
      let final = finalTranscript;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript + " ";
        else interim += transcript;
      }
      setInterimTranscript(interim);
      setFinalTranscript(final);
      setAsk(final);
      const transcriptArr = final.split(" ");
      const stopCmd = transcriptArr
      //console.log(transcriptArr)
      if (transcriptArr.length > 1) {
        cmds(stopCmd, transcriptArr);
      };
    }

    const handleRecognitionError = (event) => {
      console.log("Error occurred in recognition: " + event.error);
    };


    const cmds = (cmd, final) => {
      console.log(final)
      if (cmd.includes("stop") && cmd.includes("listening")) {
        setListening((prevListening) => !prevListening);
        const finalText = final.slice(0, -3).join(" ");
        setFinalTranscript(finalText);

        console.log("Stopped listening per command");
      } else if (cmd.includes("Francis") || cmd.includes("francis")) {
        setListening((prevListening) => !prevListening);
        setQuestion(true);
        setSnap(true)
        const finalText = cmd.slice(0, parseInt(`-${cmd.length}`)).join(" ");
        setFinalTranscript(finalText);
        console.log(finalText)
      }
    }


    recognition.onstart = handleRecognitionStart;
    recognition.onend = handleRecognitionEnd;
    recognition.onresult = handleRecognitionResult;
    recognition.onerror = handleRecognitionError;


    return () => {
      recognition.stop();
    };
  }, [listening, finalTranscript]);




  useEffect(() => {
    if (question) {
      setQuestion(false)
      setListening(false);
      recognition.stop()

      const data = ask.toLocaleLowerCase().split('francis', 2)
      // const pics = document.getElementById('photo')
      // const img = pics.getAttribute('src')
      // const img1 = img.split(',', 2)
      //console.log()
      Olama.chat(data[1]).then((response) => {
        console.log(response.message.content);
        setText(response.message.content)
        setStart(true)
      }).catch((err) => {
        console.log(err)
      })
    }
  }, [question, setQuestion])






  return (
    <div style={styles.container}>
      <CameraCapture snap={snap} setSnap={setSnap} />
      <h1>Olama chatbot</h1>
      <button
        id="microphone-btn"
        style={styles.button}
        onClick={toggleListen}
      />
      <div id="interim" style={styles.interim}>
        {interimTranscript}
      </div>
      <div id="final" style={styles.final}>
        {finalTranscript}
      </div>

      <input id="ask" style={styles.final} value={ask} onChange={(e) => { setAsk(e.currentTarget.value) }} />

      <button onClick={() => { send() }} type="submit">Ask</button>


      <SpeechSynthesis text={text} setText={setText} start={start} setStart={setStart} />

    </div>
  );
};

export default Speech;

//-------------------------CSS------------------------------------

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  button: {
    width: "60px",
    height: "60px",
    background: "lightblue",
    borderRadius: "50%",
    margin: "1em 0 2em 0",
  },
  interim: {
    color: "gray",
    border: "#ccc 1px solid",
    padding: "1em",
    margin: "1em",
    width: "300px",
  },
  final: {
    color: "black",
    border: "#ccc 1px solid",
    padding: "1em",
    margin: "1em",
    width: "300px",
  },
};

