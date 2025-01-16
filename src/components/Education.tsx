// Update the fetchData function in Education.tsx
const fetchData = async () => {
  try {
    setLoading(true);
    
    // Use Promise.allSettled to handle partial failures
    const [eduResult, certResult] = await Promise.allSettled([
      withRetry(
        supabase
          .from('education')
          .select(`
            *,
            institution:institutions(name, location)
          `)
          .order('order_index', { ascending: true })
      ),
      withRetry(
        supabase
          .from('certifications')
          .select('*')
          .order('issue_date', { ascending: false })
      )
    ]);

    if (eduResult.status === 'fulfilled') {
      setEducation(eduResult.value || []);
    } else {
      console.error('Error fetching education:', eduResult.reason);
    }

    if (certResult.status === 'fulfilled') {
      setCertifications(certResult.value || []);
    } else {
      console.error('Error fetching certifications:', certResult.reason);
    }

    // Only show error if both requests failed
    if (eduResult.status === 'rejected' && certResult.status === 'rejected') {
      setError(handleSupabaseError(eduResult.reason));
    }
  } catch (error) {
    console.error('Error fetching education data:', error);
    setError(handleSupabaseError(error));
  } finally {
    setLoading(false);
  }
};