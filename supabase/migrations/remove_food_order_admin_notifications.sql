-- Remove admin notifications for food orders since they don't require approval
-- Food orders are auto-approved as users pay for them themselves

DROP TRIGGER IF EXISTS on_new_food_order ON public.food_orders;
DROP FUNCTION IF EXISTS public.notify_admins_new_food_order();
