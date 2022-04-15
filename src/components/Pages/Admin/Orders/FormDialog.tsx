import { Dialog, Slide, Grid, Button, DialogActions, DialogContent, DialogTitle, LinearProgress } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Toast from 'components/Shared/Toast';
import { logError } from 'helpers/rxjs-operators/logError';
import { useFormikObservable } from 'hooks/useFormikObservable';
import IOrder from 'interfaces/models/order';
import React, { forwardRef, Fragment, memo, useCallback } from 'react';
import { tap } from 'rxjs/operators';
import orderService from 'services/order';
import TextField from 'components/Shared/Fields/Text';
import * as yup from 'yup';

interface IProps {
  opened: boolean;
  order?: IOrder;
  onComplete: (order: IOrder) => void;
  onCancel: () => void;
}

const validationSchema = yup.object().shape({
  description: yup.string().required().min(5).max(50),
  amount: yup.number().positive().required(),
  value: yup.number().positive().required(),
});

const useStyle = makeStyles({
  content: {
    width: 600,
    maxWidth: 'calc(95vw - 50px)'
  },
  heading: {
    marginTop: 20,
    marginBottom: 10
  }
});

const FormDialog = memo((props: IProps) => {
  const classes = useStyle(props);

  const formik = useFormikObservable<IOrder>({
    initialValues: {},
    validationSchema,
    onSubmit({id, description, amount, value}) {
      return orderService.save({id, description, amount: Number(amount), value: String(value)}).pipe(
        tap(order => {
          Toast.show(`${order.description} foi salvo com sucesso`)
          props.onComplete(order)
        }),
        logError(true)
      )
    }
  })

  const handleEnter = useCallback(() => {
    formik.setValues(props.order ?? formik.initialValues, false);
  }, [formik, props.order]);

  const handleExit = useCallback(() => {
    formik.resetForm();
  }, [formik]);

  return (
    <Dialog
      open={props.opened}
      disableBackdropClick
      disableEscapeKeyDown
      onEnter={handleEnter}
      onExited={handleExit}
      TransitionComponent={Transition}
    >

      {formik.isSubmitting && <LinearProgress color='primary' />}

      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{!!props.order?.id ? 'Editar' : 'Novo'} Pedido</DialogTitle>
        <DialogContent className={classes.content}>

            <Fragment>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Descrição" name="description" formik={formik} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Quantidade" name="amount" formik={formik} type=''/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Valor" name="value"formik={formik} mask='money'/>
                </Grid>

              </Grid>
            </Fragment>

        </DialogContent>
        <DialogActions>
          <Button onClick={props.onCancel} >Cancelar</Button>
          <Button color="primary" variant="contained" type="submit" disabled={formik.isSubmitting}>Salvar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

const Transition = memo(
  forwardRef((props: any, ref: any) => {
    return <Slide direction='up' {...props} ref={ref} />;
  })
);

export default FormDialog;
