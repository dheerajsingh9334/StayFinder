import cluster from "cluster";
import os from "os";
console.log(os.cpus().length);

const configuredWorkers = Number(process.env.WEB_CONCURRENCY);
const Cpu =
  Number.isFinite(configuredWorkers) && configuredWorkers > 0
    ? Math.floor(configuredWorkers)
    : process.env.RENDER
      ? 1
      : os.cpus().length;

if (cluster.isPrimary) {
  console.log("primary process running", process.pid);
  console.log("starting ", Cpu, "worker");

  for (let i = 0; i < Cpu; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log("worker", worker.process.pid, "died");
    console.log("Restarting Worker...");
    cluster.fork();
  });
} else {
  import("./server");
}
