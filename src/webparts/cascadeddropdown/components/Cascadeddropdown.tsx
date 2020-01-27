import * as React from 'react';
import styles from './Cascadeddropdown.module.scss';
import { ICascadeddropdownProps } from './ICascadeddropdownProps';
import { escape } from '@microsoft/sp-lodash-subset';

export interface ICascadedDropDwonState {
  title: string;
  id: number;
}
export default class Cascadeddropdown extends React.Component<ICascadeddropdownProps, ICascadedDropDwonState> {

  constructor(props: ICascadeddropdownProps, state: ICascadedDropDwonState) {
    super(props);
    this.state = {
      title: ``,
      id: 0
    };
  }

  public componentWillMount(): void {
    this.setStateVariables();
  }

  public componentDidUpdate(prevProps: ICascadeddropdownProps): void {
    // Typical usage (don't forget to compare props):
    if (this.props.selectedList !== prevProps.selectedList || this.props.selectedItem !== prevProps.selectedItem) {
      this.setStateVariables();
    }
  }

  private setStateVariables(): void {
    this.setState({
      title: this.props.selectedItem
    });
  }

  public render(): React.ReactElement<ICascadeddropdownProps> {
    return (
      <div className={styles.cascadeddropdown}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.column}>
              <span className={styles.title}>Welcome to SharePoint!</span>
              <p className={styles.subTitle}>See the behviour of cascaded dropw down</p>
              <p className={styles.description}>{escape(this.state.title)}</p>

            </div>
          </div>
        </div>
      </div>
    );
  }
}
