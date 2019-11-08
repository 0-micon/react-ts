import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Card from './components/Card';
import desk from './core/deck';

const Hello: React.FC = () => {
  // return (<div>
  //   Hello React!
  // </div>);
  return React.createElement('div', null, "Hello React!!!");
}

function Button() {
  const [counter, setCounter] = useState(5);
  return <button onClick={() => setCounter(counter + counter)}>TEST {counter}</button>;
}

// class Card extends React.Component {
//   render() {
//     return (
//       <div className="github-profile">
//         <img src="https://placehold.it/75" alt="placehold 75x75" />
//         <div className="info">
//           <div className="name">Name here...</div>
//           <div className="company">Company here...</div>
//         </div>
//       </div>
//     );
//   }
// }

interface IAppComponent {
  title: string;
}

const cards = desk(1);

class AppComponent extends React.Component<IAppComponent> {
  render() {
    return (
      <div>
        <div className="header">{this.props.title}</div>
        {cards.map(index => <Card cardIndex={index} />)}
      </div>
    );
  }
}

const App: React.FC = () => {
  return (
    <div className="App">
      <Hello />
      <Button></Button>
      <AppComponent title="The title here" />
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
