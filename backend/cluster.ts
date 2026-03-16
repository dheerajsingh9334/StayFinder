import cluster from "cluster";
import os from "os";
console.log(os.cpus().length);

const Cpu = os.cpus().length - 6;

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
