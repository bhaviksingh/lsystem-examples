import React, {useCallback, useRef, useState} from "react";
import LSystem, { Axiom } from "@bvk/lsystem";
import { completeGfxProps, GFXProps } from "../../utils";
import LSImageViewer2D from "./LSImageViewer2D";
import LSImageViewer3D from "./LSImageViewer3D";
import { useEffect } from "react";
import { axiomToStr } from "@bvk/lsystem/dist/parser";


interface LSImageViewerControllerProps {
  lSystem: LSystem,
  gfxProps?: GFXProps,
  animationEnabled?: boolean,
  swaprenderStyleEnabled?: boolean
}

type ImageRenderTypes = "2d" | "3d";

function charIs3D(l: string) {
  
  let is3D = l == "&" || l == "^" || l == "/" || l == "\\";
  console.log("Checking 3d " + l + " returning " + is3D);
  return is3D;
}
function getViewerType(lSystem: LSystem, gfxProps?: GFXProps) : ImageRenderTypes {
  console.log("VIEWER TYPE SETUP IS...", gfxProps)
  if (gfxProps && gfxProps.renderType && ! gfxProps.renderType.includes("auto")) {
    if (gfxProps.renderType.includes("2d")) 
      return "2d"
    if (gfxProps.renderType.includes("3d")) 
      return "3d"
  }
  for (let i =0; i<lSystem.axiom.length; i++) {
    if (charIs3D(lSystem.axiom[i].symbol)) {
      return "3d"
    }
  }
  for (let i =0; i<lSystem.productions.length; i++) {
    let p = lSystem.productions[i];
    let successors = Array.isArray(p.successor) ? p.successor : [p.successor]; 
    for (let j = 0; j<successors.length; j++) {
      let s = successors[j];
      for (let k = 0; k<s.letters.length; k++) {
        if (charIs3D(s.letters[k].symbol)) {
          return "3d"
        }
      }
    }
  }
  return "2d"  
}

/**
 * Component to manage viewing an LSystem as an image.
 * NOTE: IF the Lsystem has not been "iterated", this component will iterate it on the main thread. It is recommended to iterate before initializing component
 * @param props 
 * @returns 
 */
const LSImageViewerController : React.FunctionComponent<LSImageViewerControllerProps> = (props) => {

  const [viewerType, setViewerType] = useState<ImageRenderTypes>( getViewerType(props.lSystem, props.gfxProps));
  const [currentAxiom, setCurrentAxiom] = useState<Axiom>();
  const [allCurrentAxioms, setAllCurrentAxioms] = useState<Axiom[]>();
  const [currentIteration, setCurrentIteration] = useState<number>(props.lSystem.iterations);

  const currentlyAnimating = useRef<boolean>(false);
  const activeInterval = useRef<NodeJS.Timeout>();

  //Trigger re-render if the gxfProps, current axiom, or viewer type change
  const getViewer = useCallback(() => {
    if (currentAxiom) {
      const viewerProps = { gfxProps: completeGfxProps(props.gfxProps), axiom: currentAxiom };
      console.log("HERE WE GO, RENDERING NOW WITH ", viewerType);
      return viewerType === "2d" ? (
        <LSImageViewer2D {...viewerProps} key="control ler-viewer-2d" />
      ) : (
        <LSImageViewer3D {...viewerProps} key="controller-viewer-3d" />
      );
    }
  }, [ props.gfxProps, currentAxiom, viewerType])

  //When the lsystem changes, cancel any anim timers and set current iterations + all current axioms
  useEffect( () => {
    console.log("🏠🏠 i am alive")
    if (activeInterval.current) clearTimeout(activeInterval.current);
    setCurrentIteration(props.lSystem.iterations);
    setAllCurrentAxioms(props.lSystem.getAllIterationsAsObject())
  }, [ props.lSystem, props.lSystem.iterations])

  //When the currentIteration or all current Axioms change, change current axiom (trigger-re-render)
  useEffect( () => {
    console.log("🏠🏠🏠🏠🏠🏠🏠🏠🏠🏠 Changing axiom... should re-render")
    if (allCurrentAxioms)
      setCurrentAxiom(allCurrentAxioms[currentIteration]);
  }, [currentIteration, allCurrentAxioms])

  //If ls or gfx props change, viewer type may change
  useEffect(() => {
    const newViewerType = getViewerType(props.lSystem, props.gfxProps) ;
    console.log("💖💖💖💖💖 Changing LSystem or GFX props, should guess viewer type", newViewerType)
    setViewerType(newViewerType);
  }, [props.lSystem, props.gfxProps])


  //Helper functions for animations
  const stopIterationAnimation = () => {
    console.log("Anim stop", currentIteration);
    currentlyAnimating.current = false;
  }
  const startIterationAnimation = () => {
    console.log("Anim start");
    currentlyAnimating.current = true;
    setCurrentIteration(0);
  }
  //Animation is just powered by changes to currentIteration.
  //The currentIteration changes itself every x seconds.
  //STOP IF:  the LS changes the iters set to the stopping point OR forced stop 
  useEffect(() => {
    console.log("Current iteration changed", currentIteration);
    
    if (currentIteration === props.lSystem.iterations || currentlyAnimating.current === false) {
      stopIterationAnimation();
    } else {
      activeInterval.current = setTimeout(() => setCurrentIteration(currentIteration +1), props.gfxProps?.animationWaitTime || completeGfxProps(undefined).animationWaitTime);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIteration])



  return (
    <div className="stack no-gap">
      <div className="toolbar horizontal-stack edit-surface border-bottom">
        <span> viewer: {viewerType}  </span> 
        <span> iterations: {currentIteration} </span>
        {currentlyAnimating.current === true ? (
          <span onClick={() => stopIterationAnimation()} className="clickable"> stop </span>
        ) : (
          <span onClick={() => startIterationAnimation()} className="clickable"> start </span>
        )}
      </div>
      {getViewer()}
    </div>
  );
}

export default LSImageViewerController
