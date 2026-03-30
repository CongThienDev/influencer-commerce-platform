import { useCallback, useEffect, useMemo, useState } from 'react'

export function usePaginatedResource(fetcher, initialQuery = {}) {
  const queryDefaults = useMemo(
    () => ({
      page: 1,
      limit: 10,
      ...initialQuery,
    }),
    [initialQuery]
  )

  const [query, setQueryState] = useState(queryDefaults)
  const [refreshTick, setRefreshTick] = useState(0)
  const [data, setData] = useState([])
  const [meta, setMeta] = useState({
    page: queryDefaults.page,
    limit: queryDefaults.limit,
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const updateQuery = useCallback((patch) => {
    setQueryState((previous) => ({
      ...previous,
      ...patch,
    }))
  }, [])

  const setPage = useCallback(
    (page) => {
      updateQuery({ page })
    },
    [updateQuery]
  )

  const setLimit = useCallback(
    (limit) => {
      updateQuery({ page: 1, limit })
    },
    [updateQuery]
  )

  const refresh = useCallback(() => {
    setRefreshTick((value) => value + 1)
  }, [])

  useEffect(() => {
    let active = true

    async function loadResource() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetcher(query)
        if (!active) {
          return
        }

        setData(response?.data ?? [])
        setMeta(
          response?.meta ?? {
            page: query.page,
            limit: query.limit,
            total: response?.data?.length ?? 0,
          }
        )
      } catch (resourceError) {
        if (!active) {
          return
        }

        setError(resourceError)
        setData([])
        setMeta({
          page: query.page,
          limit: query.limit,
          total: 0,
        })
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadResource()

    return () => {
      active = false
    }
  }, [fetcher, query, refreshTick])

  return {
    query,
    data,
    meta,
    loading,
    error,
    setQuery: updateQuery,
    setPage,
    setLimit,
    refresh,
  }
}
