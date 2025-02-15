# ni-visa

`ni-visa` is a Node.js library that allows you to interface with instruments using the NI-VISA standard. It provides an easy-to-use API for managing VISA resources and communicating with instruments. The library expects that **RsVisa** is installed on your system. Alternatively, you can provide the path to your own dynamic library that supports the NI-VISA standard.

## Features

- **Resource Management:** List and filter VISA resources.
- **Instrument Communication:** Open an instrument and send queries.
- **Graceful Cleanup:** Automatically handles closing of instruments and resource managers.
- **Customizable:** Option to specify a custom dynamic library path.

## Requirements

- **RsVisa:** The library is built to work with RsVisa.
- **Custom Dynamic Library:** If RsVisa is not used, you can specify a custom path to a dynamic library that supports NI-VISA.
- **Node.js 23+:** The examples and type stripping support require Node.js version 23 or later.

## Installation

Install the library using npm:

```bash
npm install ni-visa
```

## Usage

Below is a usage example demonstrating how to list VISA resources, filter for USB resources, open an instrument, query its identity, and then properly close all connections:

```javascript
import { VisaInstrument, VisaResourceManager } from 'ni-visa';

const rm = new VisaResourceManager();

try {
  console.log('Listing resources...');
  const resources = rm.listResources();
  console.log(`Resources: ${resources}`);

  const usbResources = resources.filter((resource) => resource.startsWith('USB'));
  console.log(`USB resources: ${usbResources}...`);

  const selectedResource = usbResources[0];
  if (!selectedResource) {
    throw new Error('No USB resources found');
  }

  console.log(`Opening instrument: ${selectedResource}...`);
  const instr = rm.open(selectedResource);

  try {
    onInstrumentOpened(instr);
  } finally {
    console.log('Closing instrument...');
    instr.close();
  }

} catch (error) {
  console.error(error);
} finally {
  console.log('Closing default resource manager...');
  rm.close();
}

function onInstrumentOpened(instr: VisaInstrument) {
  const response = instr.query('*IDN?');
  console.log(`\nInstrument ID: ${response}\n`);
}
```

## Custom Dynamic Library Path

If you want to use your own dynamic library that supports the NI-VISA standard, you can specify its path when initializing the VisaResourceManager:

```javascript
const rm = new VisaResourceManager('/path/to/your/library');
```

## Running the Examples

The example above is provided in the examples directory and can be run directly using Node.js 23+ (which supports TypeScript type stripping). Simply navigate to the example directory and run:

```bash
npm install
node example.ts
```

## API Reference

### VisaResourceManager

- listResources(): string[]  
  Lists all available VISA resources.
- open(resource: string): VisaInstrument  
  Opens a connection to the specified VISA resource.
- close(): void  
  Closes the resource manager and cleans up resources.

### VisaInstrument

- write(data: Buffer | string): void  
  Writes data to the instrument.
- query(command: string): string  
  Sends a query command to the instrument and returns its response.
- queryBinary(command: string, bufferSize = 1024): Buffer  
  Sends a query command to the instrument and returns its response as a binary buffer.
- close(): void  
  Closes the instrument connection.

## Contributing

Contributions are welcome! If you find any issues or have suggestions, please open an issue or submit a pull request on GitHub.

## License

This project is licensed under the MIT License.

## Support

If you have any questions or need further assistance, please open an issue on the GitHub repository.
