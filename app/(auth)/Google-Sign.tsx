import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import Google from "@/public/assets/google.svg";
export default function GoogleSign() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/" });
      }}
    >
      <Button
        type="submit"
        variant="outline"
        size="login"
        className="w-full cursor-pointer flex items-center justify-center gap-2"
      >
        <Google />
        Continue with Google
      </Button>
    </form>
  );
}
