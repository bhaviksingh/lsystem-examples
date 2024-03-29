import LSystem, { parseAxiom, parseProduction } from "@bvk/lsystem";
import React, { useCallback, useState } from "react";
import { useEffect } from "react";
import {
  completeGfxProps,
  createFave,
  encodeParams,
  GFXProps,
  GFXPropsComplete,
  LSError,
  LSStatus,
} from "../../lib/utils";
import { createLSInWorker } from "../../lib/worker";
import LSConsole from "./LSStatusConsole";
import LSCodeEditor from "./LSCodeEditor";
import { GFXPropsCustomizer } from "./LSGFXEditor";
import { useRef } from "react";
import { lineIsComment, splitLines } from "./codeSyntax";
import copy from "copy-to-clipboard";
import {useHotkeys} from "react-hotkeys-hook"

interface LSEditorProps {
  onLSReset(LS: LSystem): void;
  onLSIterated(LS: LSystem): void;
  onGFXPropsUpdate(gfxProps: GFXProps): void;
  initCode?: string;
  initGFXProps?: GFXProps;
  saveToLocalStorage?: string;
  className?: string;
}

const defaultCode =
  "* Simple Spiral \n\n* Axiom: Start with A A\nA\n\n* Production: A becomes: F (forward), + (turn), A (repeat)\nA:F+A";

export const LSEditor: React.FunctionComponent<LSEditorProps> = ({
  onLSReset,
  onGFXPropsUpdate,
  initCode,
  initGFXProps,
  saveToLocalStorage,
  className,
}) => {
  const [lSystem, setLSystem] = useState<LSystem>();
  const [status, setStatus] = useState<LSStatus>();
  const [gfxProps, setGFXProps] = useState<GFXPropsComplete>(completeGfxProps(initGFXProps));
  const firstRun = useRef<boolean>(true);
  const isMounted = useRef<boolean>(false);
  const initializeCode = (): string => {
    if (initCode !== undefined) return initCode;
    if (saveToLocalStorage !== undefined) {
      let storedVal = localStorage.getItem(saveToLocalStorage);
      if (storedVal !== undefined && storedVal !== "") {
        return storedVal as string;
      }
    }
    return defaultCode;
  };
  const [currentCode, setCurrentCode] = useState<string>(initializeCode);
  const lSystemNeedsReset = useRef<boolean>(true);
  const gfxPropsNeedsReset = useRef<boolean>(true);
  const timer = useRef<number>();
  useHotkeys("ctrl+Enter, command+Enter", () => {runLS()});

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (lSystem) onLSReset(lSystem);
  }, [lSystem, onLSReset]);

  //TODO: Move line login into refresh function to optimize

  useEffect(() => {
    if (saveToLocalStorage && currentCode !== undefined) {
      //console.log("Local storage key exists setting", currentCode);
      localStorage.setItem(saveToLocalStorage, currentCode);
    }
  }, [currentCode, saveToLocalStorage]);

  const createLSystem = useCallback(
    (lsProps) => {
      // console.log("Gonna run current LS");
      
        timer.current = new Date().getMilliseconds();
        setStatus({ state: "compiling" });

        let timeoutCallback: NodeJS.Timeout; 
        const timeoutTime = 120000;
        const fn = new Promise(function (resolve, reject) {
          timeoutCallback = setTimeout(() => {reject(new Error(`Timed out in ${timeoutTime/1000} seconds - try again with fewer iterations`))}, timeoutTime);
        });
        Promise.race([fn, createLSInWorker(lsProps)])
          .then((updatedLS) => {
            if (isMounted.current) {
              let timeTaken = Math.max(new Date().getMilliseconds() - (timer.current || new Date().getMilliseconds()),0);
              setLSystem(updatedLS as LSystem);
              setStatus({ state: "compiled", message: `in ${timeTaken} milliseconds` });
            }
          })
          .catch((e) => {
            console.log(e);
            setStatus({ state: "error", errors: [{ lineNum: "global", error: e as Error }] });
          })
          .finally(() => clearTimeout(timeoutCallback));
    },
    [setStatus]
  );

  const updateCurrentGFXProps = useCallback(
    (gfxPropUpdate: GFXProps) => {
      setGFXProps((prevProps) => {
        if (gfxPropUpdate.iterations !== undefined && gfxPropUpdate.iterations !== prevProps.iterations) {
          console.log("Updating parent iterations", gfxPropUpdate.iterations)
          lSystemNeedsReset.current = true;
        } 
        gfxPropsNeedsReset.current = true;
        return { ...prevProps, ...gfxPropUpdate };
      });
    },
    [setGFXProps]
  );

  const parseLinesAndCreateLSystem = useCallback(() => {
    let lines = splitLines(currentCode);

    const relevantLinesWithNumbers : {l: string, n: number}[] = [];
    lines.forEach((line, lineNum) => {
      if (!lineIsComment(line) && line && line.trim() !== "") {
        relevantLinesWithNumbers.push({l: line, n: lineNum});
      }
    })

    const currentLines = relevantLinesWithNumbers;
    if (currentLines.length < 1) {
      console.log(currentLines);
      const noAxiomError = new Error("An LSystem needs at least one axiom");
      setStatus({ state: "error", errors: [{lineNum: 0, error: noAxiomError}] });
    } else {
      let errors: LSError[] = [];
      let status = "ready";
      let axiomLine = currentLines[0];
      try {
        parseAxiom(axiomLine.l);
      } catch (e) {
        status = "error";
        errors.push({lineNum: axiomLine.n, error: e as Error});
      }
      let productionLines = currentLines.slice(1);
      productionLines.forEach((productionLine, i) => {
        try {
          parseProduction(productionLine.l);
        } catch (e) {
          status = "error";
          errors.push({lineNum: productionLine.n, error: e as Error});
        }
      });
      if (status === "error") {
        setStatus({ state: status, errors: errors });
      } else {
        // @ts-ignore: Ignoring let error.
        setStatus({ state: "ready" });
        createLSystem({ axiom: axiomLine.l, productions: productionLines.map((p) => p.l), iterations: gfxProps.iterations });
      }
    }
  }, [createLSystem, currentCode, gfxProps.iterations]);

  const runLS = useCallback(() => {
    console.log("Time to run L-System");
    if (!gfxPropsNeedsReset.current && !lSystemNeedsReset.current) {
      //The user has clicked RUN but nothing needs re-parsing, so just re-draw.
      onGFXPropsUpdate(gfxProps)
      setStatus({state: "redrawing"});
    } 
    if (lSystemNeedsReset.current) {
      // console.log("recreating LS");
      parseLinesAndCreateLSystem();
      lSystemNeedsReset.current = false;
    } 
    if (gfxPropsNeedsReset.current) {
      console.log("recreating GFX");
      onGFXPropsUpdate(gfxProps);
      gfxPropsNeedsReset.current = false;
    }
    

  }, [gfxProps, onGFXPropsUpdate, parseLinesAndCreateLSystem]);

  const updateCurrentCode = useCallback(
    (newCode: string) => {
      setCurrentCode(newCode);
      lSystemNeedsReset.current = true;
      if (firstRun.current) {
        firstRun.current = false;
        runLS();
      }
    },
    [setCurrentCode, runLS]
  );

  const copyCurrentCode = useCallback(() => {
    let copyString = window.location.origin + "/edit" + encodeParams(currentCode, gfxProps);
    //console.log("COPYING CURRENT CODE AND GFXPROPS to " + copyString, currentCode, gfxProps);
    copy(copyString);
    alert("Copied");
  }, [currentCode, gfxProps]);

  const saveCurrentCodeLocally = useCallback(() => {
    const currentFavoriteString = localStorage.getItem("favorites");
    const currentFavorites = currentFavoriteString ? JSON.parse(currentFavoriteString) : {};
    currentFavorites[Date.now() + ""] = createFave(currentCode, gfxProps);
    localStorage.setItem("favorites", JSON.stringify(currentFavorites));
  }, [currentCode, gfxProps]);

  return (
    <div className={`stack no-gap ${className}`}>
      <div className="horizontal-stack small edit-surface toolbar border-bottom">
        <div className="clickable" onClick={() => runLS()}>
          grow<div className="gray subtext padded:left:smallest">(⌘+⏎)</div>
        </div>
        <div className="clickable" onClick={() => copyCurrentCode()}>
          share link
        </div>
        <div className="clickable" onClick={() => saveCurrentCodeLocally()}>
          save to favorites
        </div>
      </div>
      <div style={{flex:2}} className="edit-surface-light-tone border-bottom:light">
      <LSCodeEditor
        style={{ width: "100%", overflow: "visible"}}
        initialCode={currentCode}
        onCodeWasEdited={updateCurrentCode}
        className="code-text code-line-offset"
        errorList={status?.errors}
      />
      </div>
      <GFXPropsCustomizer
        gfxProps={completeGfxProps(initGFXProps)}
        GFXPropsUpdated={updateCurrentGFXProps}
        className="edit-surface-light-tone border-bottom grid gfx-controls "
      />
      <LSConsole status={status} className={"edit-surface-gray-tone padded console-height code-text"} />
    </div>
  );
};
