import logo from "@/assets/logo.png";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-10 bg-muted flex flex-col justify-center items-center gap-2">
      <Image src={logo} alt="logo" width={72} height={72} />
      <Progress className="w-20 h-1" indeterminate />
      <p className="text-sm text-muted-foreground">Preparing to fly...</p>
    </div>
  );
}

export default LoadingOverlay;
