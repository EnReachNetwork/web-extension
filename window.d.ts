// Optional, this is just an example of extending the window object for fun and profit. Change it however you want for your own interface
interface Window {
  EnReachAI: {
    name: string
    request: (msg: any) => Promise<any>
  }
  __EnReachAI: {
    name: string
    request: (msg: any) => Promise<any>
  }
}
