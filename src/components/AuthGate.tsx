import { useState } from "react";
import AuthSheet from "@/components/AuthSheet";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGateProps {
  children: (onAction: () => void) => React.ReactNode;
  onAuthenticated: () => void;
}

const AuthGate = ({ children, onAuthenticated }: AuthGateProps) => {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const handleAction = () => {
    if (!user) {
      setShowAuth(true);
    } else {
      onAuthenticated();
    }
  };

  return (
    <>
      {children(handleAction)}
      <AuthSheet open={showAuth} onOpenChange={setShowAuth} />
    </>
  );
};

export default AuthGate;
