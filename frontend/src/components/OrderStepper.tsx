import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  styled,
} from "@mui/material";
import {
  Check,
  Payment,
  LocalShipping,
  RateReview,
  CheckCircle,
  AssignmentTurnedIn,
  Home,
} from "@mui/icons-material";

// Custom connector between steps
const CustomConnector = styled(StepConnector)(() => ({
  [`& .MuiStepConnector-line`]: {
    borderColor: "#E0E0E0",
    borderTopWidth: 3,
  },
  [`&.Mui-completed .MuiStepConnector-line`]: {
    borderColor: "#4caf50", // Green color for completed steps
  },
  [`&.Mui-active .MuiStepConnector-line`]: {
    borderColor: "#8B7355", // Brown color for active step
  },
}));

// Custom icon container
const CustomStepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ ownerState }) => ({
  backgroundColor: ownerState.completed
    ? "#4caf50"
    : ownerState.active
    ? "#8B7355"
    : "#E0E0E0",
  zIndex: 1,
  color: "#fff",
  width: 50,
  height: 50,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  boxShadow:
    ownerState.completed || ownerState.active
      ? "0 4px 10px 0 rgba(0,0,0,.25)"
      : "none",
  cursor: "pointer",
  transition: "transform 0.2s, box-shadow 0.3s",
  "&:hover": {
    transform: "scale(1.1)",
  },
}));

function CustomStepIcon(props: any) {
  const { active, completed, className, icon } = props;

  // Icons mapping for steps 1 to 6
  // Logic mismatch note: Steps in OrderProcess are 1-based index but logic uses them differently.
  // Step 0: Confirmed (Just start)
  // Step 1: Address
  // Step 2: Pay
  // Step 3/4: Ship/Deliver
  // Step 5: Review

  const icons: { [index: string]: React.ReactElement } = {
    1: <AssignmentTurnedIn />, // Order Confirmed
    2: <Home />, // Shipping Address
    3: <Payment />, // Deposit Payment
    4: <LocalShipping />, // In Transit
    5: <CheckCircle />, // Delivered
    6: <RateReview />, // Review
  };

  return (
    <CustomStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      {completed ? <Check /> : icons[String(icon)]}
    </CustomStepIconRoot>
  );
}

interface OrderStepperProps {
  activeStep: number;
  onStepClick?: (step: number) => void;
}

// Labels in English
const steps = [
  "Order Confirmed",
  "Shipping Address",
  "Deposit Payment",
  "In Transit",
  "Delivered",
  "Review",
];

export default function OrderStepper({
  activeStep,
  onStepClick,
}: OrderStepperProps) {
  return (
    <Box sx={{ width: "100%", mb: 4, mt: 2 }}>
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        connector={<CustomConnector />}
        nonLinear // Allow non-linear navigation visual
      >
        {steps.map((label, index) => (
          <Step key={label} completed={activeStep > index}>
            <StepLabel
              StepIconComponent={CustomStepIcon}
              onClick={() => onStepClick && onStepClick(index)}
              sx={{
                cursor: "pointer",
                "& .MuiStepLabel-label": {
                  mt: 1,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "text.secondary",
                  transition: "all 0.2s",
                  "&.Mui-active": {
                    color: "#8B7355",
                    fontWeight: 700,
                    fontSize: "0.95rem", // Slightly larger for active step
                  },
                  "&.Mui-completed": {
                    color: "#4caf50",
                  },
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
