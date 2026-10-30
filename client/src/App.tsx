import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Owner from "./pages/Owner";
import Login from "./pages/Login";
import Operator from "./pages/Operator";
import Transporter from "./pages/Transporter";

function Router() {
  return <Switch>
    <Route path="/login" component={Login} />
    <Route path="/" component={Home} />
    <Route path="/proprietario" component={Owner} />
    <Route path="/transportadora" component={Transporter} />
    <Route path="/operador" component={Operator} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster position="top-right" />
        <Router />
      </TooltipProvider>
    </ThemeProvider>
  </ErrorBoundary>;
}
