import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { merge, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';

import {
  CHANGED_TYPES,
  CounterAction,
  CounterSaveAction,
  SaveError,
  SavePending,
  SaveSuccess,
} from '../actions/counter.actions';
import { CounterApiService } from '../services/counter-api.service';
import { AppState } from '../shared/app-state';

@Injectable()
export class CounterEffects {

  constructor(
    private counterApiService: CounterApiService,
    private actions$: Actions,
    private store$: Store<AppState>
  ) {}

  /*
   * Listens for counter changes and sends the state to the server.
   * Dispatches SAVE_PENDING, and SAVE_SUCCESS or SAVE_ERROR.
   */
  @Effect()
  saveOnChange$: Observable<CounterSaveAction> = this.actions$.pipe(
    ofType<CounterAction>(...CHANGED_TYPES),
    withLatestFrom(this.store$),
    mergeMap(([ _, state ]) =>
      merge(
        of(new SavePending()),
        this.counterApiService.saveCounter(state.counter).pipe(
          map(() => new SaveSuccess()),
          catchError((error) => of(new SaveError(error)))
        )
      )
    )
  );

}
