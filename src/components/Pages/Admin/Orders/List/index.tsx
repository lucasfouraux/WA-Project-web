import { Button, Card, CardContent, Grid, IconButton, Table, TableHead, TableRow, TableBody } from '@material-ui/core';
import Toolbar from 'components/Layout/Toolbar';
import CardLoader from 'components/Shared/CardLoader';
import EmptyAndErrorMessages from 'components/Shared/Pagination/EmptyAndErrorMessages';
import SearchField from 'components/Shared/Pagination/SearchField';
import TableCellActions from 'components/Shared/Pagination/TableCellActions';
import TableCellSortable from 'components/Shared/Pagination/TableCellSortable';
import TablePagination from 'components/Shared/Pagination/TablePagination';
import TableWrapper from 'components/Shared/TableWrapper';
import usePaginationObservable from 'hooks/usePagination';
import IOrder from 'interfaces/models/order';
import RefreshIcon from 'mdi-react/RefreshIcon';
import React, { Fragment, memo, useCallback, useState } from 'react';
import orderService from 'services/order';
import FormDialog from '../FormDialog';
import ListItem from './ListItem';

const OrderListPage = memo(() => {
  const [formOpened, setFormOpened] = useState(false);
  const [current, setCurrent] = useState<IOrder>();

  const [params, mergeParams, loading, data, error, , refresh] = usePaginationObservable(
    params => orderService.list(params),
    {orderBy: 'description', orderDirection: 'asc'},
    []
  )

  const handleCreate = useCallback(() => {
    setCurrent(null);
    setFormOpened(true);
  }, [])

  const handleEdit = useCallback((current: IOrder) => {
    setCurrent(current);
    setFormOpened(true);
  }, [])

  const formCallback = useCallback(
    (order?: IOrder) => {
      setFormOpened(false)
      refresh()
    }, [refresh]
  )

  const formCancel = useCallback(() => setFormOpened(false), [])
  const handleRefresh = useCallback(() => refresh(), [refresh])

  const { total, results } = data || ({ total: 0, results: [] } as typeof data);

  console.log(results)

  return (
    <Fragment>
      <Toolbar title="Pedidos" />
        <Card>
          <FormDialog opened={formOpened} order={current} onComplete={formCallback} onCancel={formCancel}/>

          <CardLoader show={loading}/>

          <CardContent>
            <Grid container justify='space-between' alignItems='center' spacing={2}>
              <Grid item xs={12} sm={6} lg={4}>
                <SearchField paginationParams={params} onChange={mergeParams}></SearchField>
              </Grid>

              <Grid item xs={12} sm={'auto'}>
                <Button fullWidth variant='contained' color='primary' onClick={handleCreate}>
                  Adicionar
                </Button>
              </Grid>
            </Grid>
          </CardContent>

            <TableWrapper minWidth={500}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCellSortable 
                      paginationParams={params} 
                      disabled={loading}
                      column='description' 
                      onChange={mergeParams}>
                      Descrição
                    </TableCellSortable>
                    <TableCellSortable 
                      paginationParams={params} 
                      disabled={loading}
                      column='amount' 
                      onChange={mergeParams}>
                      Quantidade
                    </TableCellSortable>
                    <TableCellSortable 
                      paginationParams={params} 
                      disabled={loading}
                      column='value' 
                      onChange={mergeParams}>
                      Valor
                    </TableCellSortable>
                    <TableCellActions>
                      <IconButton onClick={handleRefresh} >
                        <RefreshIcon />
                      </IconButton>
                    </TableCellActions>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <EmptyAndErrorMessages
                    colSpan={3}
                    error={error}
                    loading={loading}
                    hasData={results.length > 0}
                    onTryAgain={refresh}
                  />
                  {results.map(order => {
                    return <ListItem key={order.id} order={order} onEdit={handleEdit} onDeleteComplete={refresh} />
                  })}
                </TableBody>
              </Table>
            </TableWrapper>
          <TablePagination total={total} disabled={loading} paginationParams={params} onChange={mergeParams} />
        </Card>
    </Fragment>
  );
});

export default OrderListPage;
