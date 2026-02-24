import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NextEvent {
  city: string;
  date: string;
  day: string;
  ticketUrl: string | null;
}

export const useNextEvent = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["next-event"],
    staleTime: 1000 * 60 * 60,
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("tour_events")
        .select("city, date, day, ticket_url, event_date")
        .eq("is_active", true)
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(1)
        .single();

      if (error) return null;
      return data;
    },
  });

  return {
    city: data?.city ?? "",
    date: data?.date ?? "",
    day: data?.day ?? "",
    ticketUrl: data?.ticket_url ?? null,
    isLoading,
  } satisfies NextEvent & { isLoading: boolean };
};
