"use client";

import { useState } from "react";
import type { StudyPlanDay } from "@/lib/study-plan";
import type { SectionStrategy } from "@/lib/section-strategies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ChevronDown, ChevronRight, Lightbulb, ExternalLink } from "lucide-react";

interface StrategyPanelProps {
  day: StudyPlanDay;
  strategy: SectionStrategy;
}

export default function StrategyPanel({ day, strategy }: StrategyPanelProps) {
  const [expandedRules, setExpandedRules] = useState<Set<number>>(new Set());

  const toggleRule = (index: number) => {
    setExpandedRules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="overflow-y-auto space-y-4" role="region" aria-label="Strategy panel">
      {/* Day info header */}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <BookOpen className="w-4 h-4 text-primary" />
            Today&apos;s Focus
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm font-medium">{day.topic}</p>
          <p className="text-xs text-muted-foreground">{day.resource}</p>
          {day.links && day.links.length > 0 && (
            <div className="pt-1 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">📚 Today&apos;s Links:</p>
              <ul className="space-y-1">
                {day.links.map((link, i) => (
                  <li key={i} className="text-xs">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section overview */}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm">{strategy.section} Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {strategy.overview}
          </p>
        </CardContent>
      </Card>

      {/* Collapsible rules */}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm">Rules &amp; Concepts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {strategy.rules.map((rule, i) => {
            const isExpanded = expandedRules.has(i);
            return (
              <div key={i} className="border-b border-border/50 last:border-0">
                <button
                  onClick={() => toggleRule(i)}
                  className="flex items-center gap-2 w-full py-2 text-left text-xs font-medium hover:text-primary transition-colors"
                  aria-expanded={isExpanded}
                  aria-controls={`rule-content-${i}`}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate">{rule.title}</span>
                </button>
                {isExpanded && (
                  <div
                    id={`rule-content-${i}`}
                    className="pl-6 pb-2 space-y-2"
                  >
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {rule.content}
                    </p>
                    {rule.examples && rule.examples.length > 0 && (
                      <ul className="space-y-1">
                        {rule.examples.map((ex, j) => (
                          <li
                            key={j}
                            className="text-xs text-muted-foreground/80 pl-2 border-l-2 border-primary/30"
                          >
                            {ex}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Tips */}
      {strategy.tips.length > 0 && (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {strategy.tips.map((tip, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-2">
                  <span className="text-primary shrink-0">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {strategy.resources.length > 0 && (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ExternalLink className="w-4 h-4 text-primary" />
              Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {strategy.resources.map((res, i) => (
                <li key={i} className="text-xs">
                  {res.url ? (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {res.name}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{res.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
