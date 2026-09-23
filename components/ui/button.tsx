import { cva, type VariantProps } from "class-variance-authority";

const baseButton =
  "inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-full border px-[18px] text-sm font-medium text-white no-underline transition-colors duration-150 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#065fd4]";

export const buttonVariants = cva(baseButton, {
  variants: {
    variant: {
      default: "border-[#0f0f0f] bg-[#0f0f0f] hover:border-[#cc0000] hover:bg-[#cc0000]",
      red: "border-[#ff0000] bg-[#ff0000] hover:border-[#cc0000] hover:bg-[#cc0000]",
      outline: "border-[#777777] bg-transparent text-[#0f0f0f] hover:border-[#0f0f0f] hover:bg-[#f2f2f2]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type ButtonVariants = VariantProps<typeof buttonVariants>;
