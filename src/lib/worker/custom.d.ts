/* ./worker/custom.d.ts */
declare module 'comlink-loader!*' {
  class WebpackWorker extends Worker {
    constructor();

    // Add any custom functions to this class.
    // Make note that the return type needs to be wrapped in a promise.
    processData(data: string): Promise<string>;
    createLSOffThread(LS: LSProps): Promise<Axiom[]>
    iterateLSOffThread(LS: LSystem): Promise<Axiom>
  }

  export = WebpackWorker;
}