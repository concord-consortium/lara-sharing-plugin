import * as React from "react";
import * as ReactDOM from "react-dom";

import * as css from "./inline-authoring-form.sass";

import { IAuthoredState } from "../../types";
import { DefaultFirebaseAppName } from "../../config/plugin-config";

interface IProps {
  initialAuthoredState: IAuthoredState;
  saveAuthoredPluginState: (json: string) => void;
}

interface IState {
  authoredState: IAuthoredState;
}

export default class InlineAuthoringForm extends React.Component<IProps, IState> {
  public state: IState = {
    authoredState: this.setInitialState()
  };

  public render() {
    const { authoredState } = this.state;
    return (
      <div className={css.container}>
        Note: There is no need to author this plugin if you are using
        the default Firebase App "{ DefaultFirebaseAppName }".
        <form className={css.form}>
          <label htmlFor="firebaseApp">Firebase App Name</label>
          <input id="firebaseApp" value={authoredState.firebaseAppName} onChange={this.handleFirebaseAppNameChange} />
          <div className={css.inlineFormButtons}>
            <button onClick={this.saveAuthoredState} className="embeddable-save">Save</button>
            <button className="close">Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  private handleFirebaseAppNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      authoredState: {
        firebaseAppName: event.target.value
      }
    });
  }

  private cloneState(newState: IAuthoredState) {
    const prevState = (this.state && this.state.authoredState) || this.props.initialAuthoredState;
    return Object.assign({}, prevState, newState);
  }

  private setInitialState(): IAuthoredState {
      return this.cloneState(this.props.initialAuthoredState);
  }

  private saveAuthoredState = () => {
    this.props.saveAuthoredPluginState(JSON.stringify(this.state.authoredState));
  }
}
