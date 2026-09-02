export const authAppearance = {
  elements: {
    rootBox: "w-full",
    cardBox: "w-full max-w-[400px] bg-transparent shadow-none border-none",
    card: "w-full gap-6 bg-transparent p-0 shadow-none",
    header: "flex flex-col items-center gap-1.5 text-center",
    headerTitle: "text-[26px] font-semibold tracking-[-0.02em]",
    headerSubtitle: "text-[15px] text-muted-foreground",
    socialButtonsBlockButton:
      "h-11 w-full justify-center gap-2.5 rounded-xl border border-input bg-transparent text-[15px] font-medium hover:bg-muted",
    socialButtonsBlockButtonText: "text-[15px] font-medium",
    dividerRow: "my-1",
    dividerLine: "bg-hairline",
    dividerText: "font-mono text-[11px] uppercase tracking-[0.06em] text-muted-2",
    formFieldLabelRow: "mb-0",
    formFieldLabel: "text-[13px] font-medium text-muted-foreground",
    formFieldAction: "text-[13px] font-normal text-muted-foreground hover:text-foreground",
    formFieldInput:
      "h-11 rounded-xl border border-input bg-transparent px-3.5 text-[15px] dark:bg-white/[0.04]",
    formFieldRow: "gap-3.5",
    form: "gap-3.5",
    formButtonPrimary:
      "mt-1.5 h-11 w-full rounded-xl bg-foreground text-[15px] font-medium text-background normal-case shadow-none hover:bg-foreground/90",
    footer: "bg-transparent",
    footerAction: "justify-center",
    footerActionText: "text-sm text-muted-foreground",
    footerActionLink: "text-sm text-foreground underline underline-offset-[3px]",
    alertText: "text-sm text-destructive",
    formFieldErrorText: "text-sm text-destructive",
  },
} as const;

export const authLocalization = {
  formFieldAction__forgotPassword: "Forgot?",
  signIn: {
    start: {
      title: "Log in",
      subtitle: "Pick up your board where you left it.",
      actionText: "New here?",
      actionLink: "Create an account",
    },
  },
  signUp: {
    start: {
      title: "Create your account",
      subtitle: "Your first board takes about ten minutes.",
      actionText: "Already have one?",
      actionLink: "Log in",
    },
  },
};
