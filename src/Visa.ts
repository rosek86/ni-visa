import os from 'node:os';

import koffi from 'koffi';

import {
  ViAChar,
  ViAccessMode,
  ViConstBuf,
  ViConstRsrc,
  ViConstString,
  ViObject,
  ViPBuf,
  ViPFindList,
  ViPSession,
  ViPUInt32,
  ViSession,
  ViStatus,
  ViUInt32,
} from './VisaTypes.ts';

export const VisaAccessMode = {
  VI_NO_LOCK: 0,
  VI_EXCLUSIVE_LOCK: 1,
  VI_SHARED_LOCK: 2,
  VI_LOAD_CONFIG: 4,
};

export class VisaResourceManager {
  private visa: Visa;
  private session: number;

  public constructor(visaOrLib?: Visa | string) {
    if (typeof visaOrLib === 'string' || visaOrLib === undefined) {
      this.visa = new Visa(visaOrLib);
    } else {
      this.visa = visaOrLib;
    }
    this.session = this.visa.openDefaultRM();
  }

  public listResources(query = '?*') {
    return this.visa.listResources(this.session, query);
  }

  public open(resourceName: string, timeout = 5000) {
    return this.visa.open(this.session, resourceName, timeout);
  }

  public close() {
    this.visa.close(this.session);
  }
}

export class VisaInstrument {
  private visa: Visa;
  private session: number;

  public constructor(visa: Visa, session: number) {
    this.visa = visa;
    this.session = session;
  }

  public query(command: string, bufferSize = 1024) {
    return this.visa.query(this.session, command, bufferSize);
  }

  public queryBinary(command: string, bufferSize = 1024) {
    return this.visa.queryBinary(this.session, command, bufferSize);
  }

  public write(data: Buffer | string) {
    return this.visa.write(this.session, data);
  }

  public close() {
    this.visa.close(this.session);
  }
}

export class Visa {
  private visaLib: koffi.IKoffiLib;

  // ViStatus viOpenDefaultRM (ViPSession sesn);
  private viOpenDefaultRM: (session: Buffer) => number;

  // ViStatus viFindRsrc (ViSession sesn, ViConstString expr, ViPFindList findList, ViPUInt32 retCnt, ViChar _VI_FAR desc[]);
  private viFindRsrc: (
    session: number,
    query: string,
    findList: Buffer,
    retCount: Buffer,
    descriptor: Buffer,
  ) => number;

  // ViStatus viFindNext (ViFindList findList, ViChar _VI_FAR desc[]);
  private viFindNext: (session: number, descriptor: Buffer) => number;

  // ViStatus viOpen (ViSession sesn, ViConstRsrc name, ViAccessMode mode, ViUInt32 timeout, ViPSession vi);
  private viOpen: (
    session: number,
    resourceName: string,
    mode: number,
    timeout: number,
    vi: Buffer,
  ) => number;

  // ViStatus viRead (ViSession vi, ViPBuf buf, ViUInt32 cnt, ViPUInt32 retCnt);
  private viRead: (session: number, buf: Buffer, cnt: number, retCnt: Buffer) => number;

  // ViStatus viWrite (ViSession vi, ViConstBuf buf, ViUInt32 cnt, ViPUInt32 retCnt);
  private viWrite: (session: number, buf: Buffer, cnt: number, retCnt: Buffer) => number;

  // ViStatus viClose (ViObject vi);
  private viClose: (session: number) => number;

  constructor(libraryPath?: string) {
    this.visaLib = koffi.load(libraryPath ?? this.getDefaultLibrary());

    this.viOpenDefaultRM = this.visaLib.func('viOpenDefaultRM', ViStatus, [ViPSession]);
    this.viFindRsrc = this.visaLib.func('viFindRsrc', ViStatus, [
      ViSession,
      ViConstString,
      ViPFindList,
      ViPUInt32,
      ViAChar,
    ]);
    this.viFindNext = this.visaLib.func('viFindNext', ViStatus, [ViPFindList, ViAChar]);
    this.viOpen = this.visaLib.func('viOpen', ViStatus, [
      ViSession,
      ViConstRsrc,
      ViAccessMode,
      ViUInt32,
      ViPSession,
    ]);
    this.viRead = this.visaLib.func('viRead', ViStatus, [ViSession, ViPBuf, ViUInt32, ViPUInt32]);
    this.viWrite = this.visaLib.func('viWrite', ViStatus, [
      ViSession,
      ViConstBuf,
      ViUInt32,
      ViPUInt32,
    ]);
    this.viClose = this.visaLib.func('viClose', ViStatus, [ViObject]);
  }

  private getDefaultLibrary() {
    const platform = os.platform();
    if (platform === 'win32') {
      return os.arch() === 'x64' ? 'visa64.dll' : 'visa32.dll';
    }
    if (platform === 'darwin') {
      return '/Library/Frameworks/RsVisa.framework/Versions/A/RsVisa/librsvisa.dylib';
    }
    if (platform === 'linux') {
      return 'librsvisa';
    }
    throw new Error(`Unsupported platform: ${platform}`);
  }

  /**
   * Opens the default VISA resource manager.
   * Throws an error if the operation fails.
   */
  public openDefaultRM() {
    const buffer = Buffer.alloc(4);
    const status = this.viOpenDefaultRM(buffer);
    if (status !== 0) {
      throw new Error(`viOpenDefaultRM failed with status: ${status}`);
    }
    const session = buffer.readUInt32LE(0);
    return session;
  }

  /**
   * Lists VISA resources (devices) available matching the given query.
   * The default query '?*' finds all devices.
   *
   * @param {number} session - VISA session handle.
   * @param {string} query - Resource query string (default: '?*').
   * @returns {string[]} An array of resource strings.
   */
  public listResources(session: number, query = '?*') {
    // Prepare pointers and a buffer for resource discovery.
    const findListPtr = Buffer.alloc(4);
    const retCountPtr = Buffer.alloc(4);
    const resourceNameBuffer = Buffer.alloc(1024); // Buffer to hold resource name

    // Call viFindRsrc to search for resources
    const status = this.viFindRsrc(session, query, findListPtr, retCountPtr, resourceNameBuffer);

    if (status !== 0) {
      throw new Error(`viFindRsrc failed with status: ${status}`);
    }

    const findList = findListPtr.readUInt32LE(0);
    const numResources = retCountPtr.readUInt32LE(0);
    const resources: string[] = [];

    // Get the first resource from the buffer
    const resourceName = resourceNameBuffer.toString('utf8').split('\0').shift();
    if (resourceName) {
      resources.push(resourceName);
    }

    // Iterate over remaining resources (if any)
    for (let i = 1; i < numResources; i++) {
      resourceNameBuffer.fill(0); // Clear buffer before next call
      const nextStatus = this.viFindNext(findList, resourceNameBuffer);
      if (nextStatus !== 0) {
        throw new Error(`viFindNext failed with status: ${nextStatus}`);
      }
      const resourceName = resourceNameBuffer.toString('utf8').split('\0').shift();
      if (resourceName) {
        resources.push(resourceName);
      }
    }

    return resources;
  }

  /**
   * Opens a VISA session with the specified resource name.
   *
   * @param {number} session - VISA session handle.
   * @param {string} resourceName - Resource name string.
   * @param {number} timeout - Timeout in milliseconds (default: 5000).
   * @returns {number} A VISA session handle.
   */
  public open(session: number, resourceName: string, timeout = 5000) {
    const vi = Buffer.alloc(4);
    const status = this.viOpen(session, resourceName, VisaAccessMode.VI_NO_LOCK, timeout, vi);

    if (status !== 0) {
      throw new Error(`viOpen failed with status: ${status}`);
    }

    return new VisaInstrument(this, vi.readUInt32LE(0));
  }

  /**
   * Reads data from the VISA session.
   *
   * @param {number} session - VISA session handle.
   * @param {Buffer} buffer - Buffer to read data into.
   * @returns {number} Number of bytes read.
   */
  public read(session: number, buffer: Buffer) {
    const retCount = Buffer.alloc(4);
    const status = this.viRead(session, buffer, buffer.length, retCount);
    if (status !== 0) {
      throw new Error(`viRead failed with status: ${status}`);
    }
    return retCount.readUInt32LE(0);
  }

  /**
   * Writes data to the VISA session.
   *
   * @param {number} session - VISA session handle.
   * @param {Buffer} buffer - Buffer containing data to write.
   * @returns {number} Number of bytes written.
   */
  public write(session: number, data: Buffer | string) {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const retCount = Buffer.alloc(4);
    const status = this.viWrite(session, buffer, buffer.length, retCount);
    if (status !== 0) {
      throw new Error(`viWrite failed with status: ${status}`);
    }
    return retCount.readUInt32LE(0);
  }

  public query(session: number, command: string, bufferSize = 1024) {
    const buffer = Buffer.alloc(bufferSize);
    this.write(session, Buffer.from(`${command}\n`));
    const bytesRead = this.read(session, buffer);
    return buffer.toString('utf8', 0, bytesRead).trim();
  }

  public queryBinary(session: number, command: string, bufferSize = 1024) {
    const buffer = Buffer.alloc(bufferSize);
    this.write(session, Buffer.from(`${command}\n`));
    const bytesRead = this.read(session, buffer);
    return buffer.slice(0, bytesRead);
  }

  /**
   * Closes the VISA session (resource manager) if open.
   *
   * @param {number} vi - VISA session handle.
   */
  public close(vi: number) {
    const status = this.viClose(vi);
    if (status !== 0) {
      throw new Error(`viClose failed with status: ${status}`);
    }
  }
}
