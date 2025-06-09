import { Link } from "react-router-dom";
import SignUpForm from "./Functions/SignUpForm";

export default function SignUp() {
  return (
    <div className="p-4 grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img
          src="/images/auth-pic.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-fit"
        />
      </div>
      <div className="flex flex-col gap-4 p-4 md:py-2.5 md:px-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <div className="w-[60px] h-[60px] text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <img
                src="/images/logo.png"
                alt="logo"
                className="inset-0 w-full object-fit"
              />
            </div>
            <div>
              <h2 className="text-primary text-2xl font-inter font-semibold">
                Roll call
              </h2>
              <h2 className="text-primary font-inter font-semibold text-sm md:text-base">
                Your Presence, Digitally Verified.
              </h2>
            </div>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full ">
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  );
}
