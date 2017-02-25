import { h, Component } from 'preact'

export default class Layout extends Component {
  render() {
    return (
      <div>
        <div class="ui fixed menu">
          <div class="ui container">
            <a href="#" class="header item">HackUrba</a>
            <div class="ui item">
              <div class="ui transparent icon input">
                <input class="prompt large" type="text" placeholder="Saisissez une adresse…" />
                <i class="search link icon"></i>
              </div>
            </div>
          </div>
        </div>
        <div>Page</div>
      </div>
    )
  }
}
