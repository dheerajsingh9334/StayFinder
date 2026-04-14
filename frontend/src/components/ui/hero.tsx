'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/shadcn-button';
import { Link } from 'react-router-dom';

type HeroAction = {
  label: string;
  href: string;
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'destructive';
};

type HeroProps = Omit<React.HTMLAttributes<HTMLElement>, 'title'> & {
  gradient?: boolean;
  blur?: boolean;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: HeroAction[];
  titleClassName?: string;
  subtitleClassName?: string;
  actionsClassName?: string;
};

const Hero = React.forwardRef<HTMLElement, HeroProps>(
  (
    {
      className,
      gradient = true,
      blur = true,
      title,
      subtitle,
      actions,
      titleClassName,
      subtitleClassName,
      actionsClassName,
      ...props
    },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          'relative z-0 flex min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden rounded-md bg-background',
          className,
        )}
        {...props}
      >
        {gradient && (
          <div className="absolute top-0 isolate z-0 flex w-screen flex-1 items-start justify-center">
            {blur && (
              <div className="absolute top-0 z-50 h-48 w-screen bg-transparent opacity-10 backdrop-blur-md" />
            )}

            <div className="absolute inset-auto z-50 h-36 w-md -translate-y-[-30%] rounded-full bg-primary/60 opacity-80 blur-3xl" />

            <motion.div
              initial={{ width: '8rem' }}
              viewport={{ once: true }}
              transition={{ ease: 'easeInOut', delay: 0.3, duration: 0.8 }}
              whileInView={{ width: '16rem' }}
              className="absolute top-0 z-30 h-36 -translate-y-[20%] rounded-full bg-primary/60 blur-2xl"
            />

            <motion.div
              initial={{ width: '15rem' }}
              viewport={{ once: true }}
              transition={{ ease: 'easeInOut', delay: 0.3, duration: 0.8 }}
              whileInView={{ width: '30rem' }}
              className="absolute inset-auto z-50 h-0.5 -translate-y-[-10%] bg-primary/60"
            />

            <motion.div
              initial={{ opacity: 0.5, width: '15rem' }}
              whileInView={{ opacity: 1, width: '30rem' }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: 'easeInOut',
              }}
              style={{
                backgroundImage:
                  'conic-gradient(var(--conic-position), var(--tw-gradient-stops))',
              }}
              className="absolute inset-auto right-1/2 h-56 w-120 overflow-visible  /60   [--conic-position:from_70deg_at_center_top]"
            >
              <div className="absolute left-0 bottom-0 z-20 h-40 w-full bg-background mask-[linear-gradient(to_top,white,transparent)]" />
              <div className="absolute left-0 bottom-0 z-20 h-full w-40 bg-background mask-[linear-gradient(to_right,white,transparent)]" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0.5, width: '15rem' }}
              whileInView={{ opacity: 1, width: '30rem' }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: 'easeInOut',
              }}
              style={{
                backgroundImage:
                  'conic-gradient(var(--conic-position), var(--tw-gradient-stops))',
              }}
              className="absolute inset-auto left-1/2 h-56 w-120    /60 [--conic-position:from_290deg_at_center_top]"
            >
              <div className="absolute right-0 bottom-0 z-20 h-full w-40 bg-background mask-[linear-gradient(to_left,white,transparent)]" />
              <div className="absolute right-0 bottom-0 z-20 h-40 w-full bg-background mask-[linear-gradient(to_top,white,transparent)]" />
            </motion.div>
          </div>
        )}

        <motion.div
          initial={{ y: 100, opacity: 0.5 }}
          viewport={{ once: true }}
          transition={{ ease: 'easeInOut', delay: 0.3, duration: 0.8 }}
          whileInView={{ y: 0, opacity: 1 }}
          className="relative z-50 container flex flex-1 -translate-y-10 flex-col justify-center gap-4 px-5 md:px-10"
        >
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1
              className={cn(
                'text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl',
                titleClassName,
              )}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={cn(
                  'max-w-3xl text-xl text-muted-foreground',
                  subtitleClassName,
                )}
              >
                {subtitle}
              </p>
            )}
            {actions && actions.length > 0 && (
              <div
                className={cn(
                  'mt-8 flex flex-wrap justify-center gap-4',
                  actionsClassName,
                )}
              >
                {actions.map((action, index) => {
                  const isExternal = /^https?:\/\//.test(action.href);
                  const isApiRoute = action.href.startsWith('/api/');

                  return (
                    <Button
                      key={index}
                      variant={action.variant || 'default'}
                      asChild
                    >
                      {isExternal ? (
                        <a href={action.href} target="_blank" rel="noreferrer">
                          {action.label}
                        </a>
                      ) : isApiRoute ? (
                        <a href={action.href}>{action.label}</a>
                      ) : (
                        <Link to={action.href}>{action.label}</Link>
                      )}
                    </Button>
                  );
                })}
              </div>
            )}
            {props.children}
          </div>
        </motion.div>
      </section>
    );
  },
);
Hero.displayName = 'Hero';

export { Hero };
