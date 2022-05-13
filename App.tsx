
import { Provider } from 'react-redux';
import store from './redux/store';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Navigation from './navigation';

export default function App() {

    return (
      <Provider store={store}>
      <SafeAreaProvider>
        <Navigation/>
        <StatusBar />
      </SafeAreaProvider>
      </Provider>
    );
}
