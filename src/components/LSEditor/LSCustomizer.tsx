
import LSystem, { Axiom, parseAxiom, parseProduction, Production } from "@bvk/lsystem";
import React from "react"
import CopyToClipboard from "react-copy-to-clipboard";
import { Link } from "react-router-dom";
import { encodeParams, flattenLSProps, GFXProps, LSProps, completeGfxProps } from "../../lib/utils";
import { GFXPropsCustomizer } from "./LSGFXEditor";

interface CustomizerProps {
  onLSReset(LS: LSystem): void;
  onLSIterated(LS: LSystem): void;
  onGFXPropsUpdate(gfxProps: GFXProps): void;
  initLSProps: LSProps
  initGFXProps?: GFXProps
}

interface CustomizerState {
  errorMessage: string,
  LSData: LSProps
}

/**
 * MAJOR TODOS:
 * change error status system in LS Customizer
 * implement async / await once it exists in package
 * fix CSS obviously
 * THE IDs in productions are incorrect, use a * function instead of what you're doing now
 */

/**
 * LSCustomizer stores the LSystem that is updated by the UI.
 * When the LSCustomizer updates the LSystem, or the iterations, it uses callback functions to update its parent
 */
export default class LSCustomizer extends React.Component<CustomizerProps, CustomizerState> {

  render() {
    return "Deprecated LSCustomizer"
  }
//   LSystem: LSystem | undefined;
//   axiom: Axiom | undefined;
//   productions: Production[] | undefined;
  
//   state: CustomizerState = {
//     LSData: this.props.initLSProps,
//     errorMessage: ""
//   }
//   //Receive state from children, and update LSystem
//   updateAxiom = (ax: Axiom, axString: string) => {
//     this.axiom = ax;
//     let newLSData = this.state.LSData;
//     newLSData.axiom = axString;
//     this.setState({LSData: newLSData});
//     //this.resetLS();
    
//   }
//   updateProductions = (productions: Production[], productionStrings: string[]) => {
//     this.productions = productions;
//     let newLSData = this.state.LSData;
//     newLSData.productions = productionStrings;
//     this.setState({LSData: newLSData});
//     //this.resetLS();
//   }

//   resetLS = () => {
//     if (this.axiom && this.productions && this.productions.length > 0) {
//       let newLS;
//       try {
//         newLS = new LSystem(this.axiom, this.productions, this.state.LSData.iterations);
//         //TODO: ASYNC AWAIT
//         //Loading spinner here
//         newLS.iterate();
//         //End loading spinner when its done....
//         this.props.onLSReset(newLS);
//         this.LSystem = newLS;
//         this.setState({ errorMessage: "" });

//       } catch (e) {
//         console.log(newLS);
//         this.setState({ errorMessage: e.message + " check console for more info" });
//       }
//     } else {
//       this.setState({ errorMessage: "Not recreating LSystem, axiom or productions didn't exist" })
//     }
//   }
//   updateIterations = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let newValue = parseFloat(e.target.value);
//     let newLSData = this.state.LSData;
//     newLSData.iterations = newValue;
//     this.setState({LSData: newLSData});
//     if (!this.LSystem) {
//       this.setState({ errorMessage: "cant iterate an LSystem doesnt exist yet" });
//       return;
//     }
//     try {
//       this.LSystem.setIterations(newValue);
//       this.LSystem.iterate();
//       this.props.onLSIterated(this.LSystem);
//       this.setState({ errorMessage: "" })
//     } catch (e) {
//       this.setState({ errorMessage: e.message })
//     }
//   }

//   //Generate UI
//   getControls = () => {
//     let iterationControl = this.getIterationController();
//     let axiomControl = <AxiomCustomizer didUpdate={this.updateAxiom} key={"axiom-controls"} initAxiom={this.props.initLSProps.axiom} />
//     let productionsControl = <ProductionsCustomizer didUpdate={this.updateProductions} key={"production-controls"} initProductions={this.props.initLSProps.productions} />

//     let controls = [];
//     controls.push(iterationControl);
//     controls.push(axiomControl);
//     controls.push(productionsControl);
//     return controls;
//   }

//   getIterationController = () => {
//     return (
//       <div key="iteration-control">
//         <label> Iterations </label>
//         <input type="number" onChange={this.updateIterations} value={this.state.LSData.iterations} min={0} />
//       </div>
//     )
//   }
//   render = () => {
//     return (
//       <div className="stack border sticky">
//         <div>
//           <em> LSystem Editor </em> <br />
//           <div>
//             Status:
//             {this.state.errorMessage === ""
//               ? "✅"
//               : "🛑 " + this.state.errorMessage}{" "}
//           </div>
//           <div className="horizontal-stack">
//             <span
//               className="clickable"
//               onClick={(e) => this.resetLS()}
//               key="refresh-control"
//             >
//               Run LS
//             </span>
//             {CopyTextButton(this.state.LSData)}
//             <PasteOverrideInput />
//           </div>
//         </div>
//         <div className="stack small">
//           <em> LSystem properties </em>
//           {this.getControls()}
//         </div>
//         <div className="stack small">
//           <em> GFX Properties </em>
//           <GFXPropsCustomizer
//             gfxProps={completeGfxProps(this.props.initGFXProps)}
//             GFXPropsUpdated={this.props.onGFXPropsUpdate}
//           />
//         </div>
//       </div>
//     );
//   }
// }

// // Overrides

// class PasteOverrideInput extends React.Component<{ }, { text: string, pasteOpen: boolean }> {
//   state = {
//     text: "",
//     pasteOpen: false
//   }
//   textToLSData = () => {
//     let txt = this.state.text;
//     let txtArray = txt.split("\n");
//     return {axiom: txtArray[0], productions: txtArray.splice(1)}
//   }
//   getTextBox = () => {
//     let data = this.textToLSData();
//     return (<div>
//       <span> <i> Enter the LSystem here, with a new line for each production. Axiom comes first</i></span>
//       <textarea onChange={(e) => { this.setState({ text: e.target.value }) }} value={this.state.text} />
//       <span className="clickable"> <Link to={`/edit${encodeParams(data)}`} > submit </Link> </span>
//     </div >)
//   }
//   render() {
//     return (
//     <div>
//       <span className="clickable" onClick={(e) => this.setState({ pasteOpen: !this.state.pasteOpen })}>
//         override {this.state.pasteOpen ? "-" : "+"}
//       </span>
//       {this.state.pasteOpen && this.getTextBox()}
//     </div>
//     )
//   }
// }

// function CopyTextButton(LSData: LSProps) {
//   return (
//     <div>
//     <CopyToClipboard text={flattenLSProps(LSData, "\n")} onCopy={() => alert("Copied!")}>
//       <span className="clickable"> copy </span>
//     </CopyToClipboard>
//   </div>
//   )
// }

// //AxiomCustomizer.js

// interface AxiomProps {
//   initAxiom?: string;
//   didUpdate(ax: Axiom, axString: string): void;
// }
// interface AxiomState {
//   axiomString: string;
//   errorMessage: string;
//   axiomParses: boolean;
// }
// class AxiomCustomizer extends React.Component<AxiomProps, AxiomState> {
//   state: AxiomState = {
//     axiomString: this.props.initAxiom || "",
//     axiomParses: false,
//     errorMessage: ""
//   }
//   componentDidMount = () => {
//     this.parseAxiom(this.state.axiomString);
//   }
//   parseAxiom = (axiomString: string) => {
//     this.setState({ axiomString: axiomString });
//     try {
//       let axiomObj = parseAxiom(axiomString);
//       this.setState({ axiomParses: true, errorMessage: "" });
//       this.props.didUpdate(axiomObj, axiomString);
//     } catch (e) {
      
//       this.setState({ axiomParses: false, errorMessage: e.message});
//     }
//   }
//   render() {
//     return (
//       <div>
//         <label> Axiom </label>
//         <input className={`padded border-bottom ${this.state.axiomParses ? 'green-border' : 'red-border'}`}
//           onChange={(e) => this.parseAxiom(e.target.value)}
//           value={this.state.axiomString} />
//         <div className="red subtext"> {this.state.errorMessage} </div>
//       </div>)
//   }
// }

// //ProductionsCustomizer.js
// interface ManyProductionProps {
//   initProductions?: string[],
//   didUpdate(productions: Production[], productionString: string[]): void
// }
// interface ManyProductionState {
//   productionStrDict: { [key: string]: string },
//   errorMessages: { [key: string]: string }
// }
// class ProductionsCustomizer extends React.Component<ManyProductionProps, ManyProductionState> {
//   productionObjDict: { [key: string]: Production } = {};
//   constructor(props: ManyProductionProps) {
//     super(props);
//     let productionDict: { [key: string]: string } = {};
//     if (this.props.initProductions) {
//       this.props.initProductions.forEach((initProduction, index) => {
//         let pKey = index + "-production" as string;
//         productionDict[pKey] = initProduction;
//       })
//     }
//     this.state = {
//       productionStrDict: productionDict,
//       errorMessages: {}
//     }
//   }
//   //Updating and syncing state
//   componentDidMount = () => {
//     if (this.props.initProductions) {
//       let productionKeys = Object.keys(this.state.productionStrDict);
//       productionKeys.forEach((pKey) => {
//         let pString = this.state.productionStrDict[pKey];
//         this.updateProduction(pString, pKey);
//       })
//     }
//   }
//   updateParent = () => {
//     let productions = { ...this.productionObjDict };
//     let productionValues = Object.values(productions);
//     //TODO: Copying them over here, but this should happen in LSystem instead. Remove later
//     let copiedvalues: Production[] = [];
//     productionValues.forEach((pv) => {
//       let npv = { ...pv };
//       copiedvalues.push(npv);
//     })
//     let correctKeys = Object.keys(this.productionObjDict);
//     let productionStrings: string[] = [];
//     correctKeys.forEach((key) => {
//       productionStrings.push(this.state.productionStrDict[key]);
//     })
//     //console.log("ProductionCuztomizer sending back to parent");
//     //console.log(productions);
//     this.props.didUpdate(copiedvalues, productionStrings);
//   }
//   updateProduction = (productionString: string, productionKey: string) => {
//     console.log("Updating: " + productionString + " with key " + productionKey);
//     let productionStrings = this.state.productionStrDict;
//     productionStrings[productionKey] = productionString;
//     this.setState({ productionStrDict: productionStrings });
//     try {
//       let productionObj = parseProduction(productionString);
//       console.log("Parsed, here it is ");
//       console.log(productionObj);

//       this.productionObjDict[productionKey] = productionObj;
//       //console.log(this.productionObjDict);
//       this.updateParent();
//       let errorMessages = this.state.errorMessages;
//       delete errorMessages[productionKey];
//       this.setState({ errorMessages: errorMessages });
//     } catch (e) {
//       let errorMessages = this.state.errorMessages;
//       errorMessages[productionKey] = e.message;
//       this.setState({ errorMessages: errorMessages });
//     }
//   }
//   //Altering number of productions
//   removeProduction = (productionKey: string) => {
//     let productionStrings = this.state.productionStrDict;
//     delete productionStrings[productionKey];
//     let errorStrings = this.state.errorMessages;
//     delete errorStrings[productionKey];
//     this.setState({ productionStrDict: productionStrings, errorMessages: errorStrings });
//     delete this.productionObjDict[productionKey];
//     this.updateParent();
//   }
//   addProduction = () => {
//     let numKeys = Object.keys(this.state.productionStrDict).length;
//     let nextKey = numKeys + 1 + "-production";
//     let productionStrings = this.state.productionStrDict;
//     productionStrings[nextKey] = "";
//     this.setState({ productionStrDict: productionStrings });
//   }
//   //Generating UI 
//   getProductions = () => {
//     let productionKeys = Object.keys(this.state.productionStrDict);
//     return productionKeys.map((pKey, index) => {
//       let pString = this.state.productionStrDict[pKey];
//       let productionInput = (
//         <div key={pKey} className="stack small">
//           <div>
//             <label> Prod {index}
//               <span className="clickable right-button"
//                 onClick={(e) => this.removeProduction(pKey)}>
//                 -
//                 </span>
//             </label>
//             <input key={pKey + "-input"}
//               className={`padded border-bottom ${this.state.errorMessages[pKey] ? 'red-border' : 'green-border'}`}
//               onChange={(e) => this.updateProduction(e.target.value, pKey)}
//               value={pString} />

//           </div>
//           <div className="red subtext"> {this.state.errorMessages[pKey]} </div>
//         </div>);
//       return productionInput;
//     })
//   }
//   render() {
//     return (<div>
//       {this.getProductions()}
//       <span className="clickable" onClick={this.addProduction}>Add production</span>
//     </div>)
//   }
}


