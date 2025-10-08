<script lang="ts" module>
  import type { WithElementRef } from "bits-ui";
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from "svelte/elements";
  import { type VariantProps, tv } from "tailwind-variants";

  export const buttonVariants = tv({
    base: "ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        green: "bg-green-700 text-primary-foreground hover:bg-green-700/90",
        blue: "bg-blue-700 text-primary-foreground hover:bg-blue-700/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-input bg-background hover:bg-accent hover:text-accent-foreground border",
        outline_primary:
          "border-primary border text-primary hover:bg-primary hover:text-primary-foreground",
        outline_green:
          "border-green-700 border text-green-700 hover:bg-green-700 hover:text-primary-foreground",
        outline_blue:
          "border-blue-700 border text-blue-700 hover:bg-blue-700 hover:text-primary-foreground",

        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  });

  export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
  export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

  export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
    WithElementRef<HTMLAnchorAttributes> & {
      variant?: ButtonVariant;
      size?: ButtonSize;
    };
</script>

<script lang="ts">
  import { cn } from "$lib/utils.js";

  let {
    class: className,
    variant = "default",
    size = "default",
    ref = $bindable(null),
    href = undefined,
    type = "button",
    children,
    ...restProps
  }: ButtonProps = $props();
</script>

{#if href}
  <a
    bind:this={ref}
    class={cn(buttonVariants({ variant, size }), className)}
    {href}
    {...restProps}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    bind:this={ref}
    class={cn(buttonVariants({ variant, size }), className)}
    {type}
    {...restProps}
  >
    {@render children?.()}
  </button>
{/if}
