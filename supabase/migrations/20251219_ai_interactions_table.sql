-- Migration: AI Interactions Table for Financial Brain Learning
-- Description: Creates table to log AI interactions for learning and analytics
-- Created: 2025-12-19

-- Create ai_interactions table
CREATE TABLE IF NOT EXISTS public.ai_interactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  question text NOT NULL,
  response text NOT NULL,
  analysis_type varchar(50) NOT NULL DEFAULT 'general_advisory',
  metadata jsonb NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add RLS (Row Level Security)
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their own AI interactions"
  ON public.ai_interactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI interactions"
  ON public.ai_interactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI interactions"
  ON public.ai_interactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all AI interactions"
  ON public.ai_interactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'support')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON public.ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_analysis_type ON public.ai_interactions(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at ON public.ai_interactions(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE public.ai_interactions IS 'Logs AI interactions for learning and analytics';
COMMENT ON COLUMN public.ai_interactions.question IS 'The user question or query';
COMMENT ON COLUMN public.ai_interactions.response IS 'The AI response generated';
COMMENT ON COLUMN public.ai_interactions.analysis_type IS 'Type of analysis performed (budget_analysis, investment_planning, etc.)';
COMMENT ON COLUMN public.ai_interactions.metadata IS 'Additional metadata about the interaction (context, confidence, etc.)';

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at_ai_interactions()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at_ai_interactions
  BEFORE UPDATE ON public.ai_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at_ai_interactions();
