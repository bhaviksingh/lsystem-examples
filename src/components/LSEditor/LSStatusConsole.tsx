import { LSStatus } from "../utils";
import React, {useState, useEffect} from "react"

interface LSConsoleProps {
  status?: LSStatus,
  className?: string
}

interface StatusLog {
  timecode: string,
  status: LSStatus
}

const LSConsole : React.FunctionComponent<LSConsoleProps> = ( {status, className}) => {
  
  const [ statusLog, setStatusLog] = useState<StatusLog[]>([]);
  //const [ currentStatus, setCurrentStatus] = useState<JSX.Element>( statusToEl(status));

  useEffect(() => {
    if (status) {
      const statusEl = statusToEl(status);
      //setCurrentStatus(statusEl);
      setStatusLog((prev) => [...prev, { timecode: new Date().toTimeString(), status }]);
    }
  }, [status])

  return <div className={className}> {statusLog.map((logStatus) => statusToEl(logStatus.status, logStatus.timecode) )} </div>
}

const statusToEl = (status: LSStatus | undefined, timecode?: string) : JSX.Element => {
  let stringEl;
  
  if (!status) {
    stringEl = <div> No status available </div>
  } else {
  switch (status.state) {
    case "error":
      stringEl = (
        <div>
          <span> Status has error</span>
          <ul>
            {status.errors &&
              status.errors.map((err, i) => (
                <li key={`error-${i}`} >
                  <span className="red">{err.lineNum === "global" ? "LS Creation failed" : "Error parsing line: " + err.lineNum}</span>
                  <span>{err.error.message}</span>
                </li>
              ))}
          </ul>
        </div>
      ); 
      break;
    case "compiling":
      stringEl = <div> Compiling </div>
      break;
    case "compiled":
      stringEl = <div> Compiled </div>
      break;
    case "ready":
      stringEl = <div> About to compile... </div>
      break;
    default:
      stringEl = <div> idk lol </div>
      break;
  }}
  let timecodeEl = timecode ? <span className="grey"> {timecode} </span> : "";
  return <div > {timecodeEl} {stringEl} </div>
}



export default LSConsole;