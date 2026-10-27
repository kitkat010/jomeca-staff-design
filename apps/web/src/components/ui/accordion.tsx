// shadcn/ui accordion composition, adapted from the supplied React prototype.
import * as Primitive from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';
import type { ComponentProps } from 'react';

export const Accordion = Primitive.Root;
export const AccordionItem = Primitive.Item;
export function AccordionTrigger({
  children,
  ...props
}: ComponentProps<typeof Primitive.Trigger>) {
  return (
    <Primitive.Header>
      <Primitive.Trigger className="faq-trigger" {...props}>
        {children}
        <Plus size={19} aria-hidden="true" />
      </Primitive.Trigger>
    </Primitive.Header>
  );
}
export function AccordionContent({
  children,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Content className="faq-content" {...props}>
      {children}
    </Primitive.Content>
  );
}
