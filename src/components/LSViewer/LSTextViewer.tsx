import { Axiom } from '@bvk/lsystem'

export default function LSTextViewer(axioms: string[] | undefined) {
  if (!axioms)  return <div>No axioms exist</div>
  let textDivs = axioms.map((val, index) => (
    <li>  { val}  </li>
  ));
  return <ol style={{width: "100%", height: "100%", overflow: "scroll"}}> {textDivs} </ol>
}