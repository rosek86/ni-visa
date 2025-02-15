import koffi from 'koffi';

// https://www.ivifoundation.org/downloads/VISA/vpp432_2022-05-19.pdf

// ViUInt32       unsigned long
export const ViUInt32 = koffi.alias('ViUInt32', 'uint32');
// ViPUInt32      ViUInt32 *
export const ViPUInt32 = koffi.pointer(ViUInt32);
// ViAUInt32      ViUInt32[]
// ViInt32        signed long
export const ViInt32 = koffi.alias('ViInt32', 'int32');
// ViPInt32       ViInt32 *
export const ViPInt32 = koffi.pointer(ViInt32);
// ViAInt32       ViInt32[]
// ViUInt64       Unsigned int64 or u_int64_t
// ViPUInt64      ViUInt64 *
// ViAUInt64      ViUInt64[]
// ViInt64        signed int64 or int64_t
// ViPInt64       ViInt64 *
// ViAInt64       ViInt64[]
// ViUInt16       unsigned short
// ViPUInt16      ViUInt16 *
// ViAUInt16      ViUInt16[]
// ViInt16        signed short
// ViPInt16       ViInt16 *
// ViAInt16       ViInt16[]
// ViUInt8        unsigned char
// ViPUInt8       ViUInt8 *
// ViAUInt8       ViUInt8[]
// ViInt8         signed char
// ViPInt8        ViInt8 *
// ViAInt8        ViInt8[]
// ViAddr         void *
// ViPAddr        ViAddr *
// ViAAddr        ViAddr[]
// ViChar         char
export const ViChar = koffi.alias('ViChar', 'char');
// ViPChar        ViChar *
export const ViPChar = koffi.pointer(ViChar);
// ViAChar        ViChar[]
export const ViAChar = koffi.pointer(ViChar);
// ViByte         unsigned char
export const ViByte = koffi.alias('ViByte', 'uchar');
// ViPByte        ViByte *
export const ViPByte = koffi.pointer(ViByte);
// ViAByte        ViByte[]
// ViBoolean      ViUInt16
// ViPBoolean     ViBoolean *
// ViABoolean     ViBoolean[]
// ViReal32       float
// ViPReal32      ViReal32 *
// ViAReal32      ViReal32[]
// ViReal64       double
// ViPReal64      ViReal64 *
// ViAReal64      ViReal64[]
// ViBuf          ViPByte
// ViConstBuf     const ViByte *
export const ViConstBuf = koffi.pointer(ViByte);
// ViPBuf         ViPByte
export const ViPBuf = koffi.pointer(ViByte);
// ViABuf         ViBuf[]
// ViString       ViPChar
// ViConstString  const ViChar *
export const ViConstString = koffi.pointer(ViChar);
// ViPString      ViPChar
// ViAString      ViString[]
// ViRsrc         ViString
// ViConstRsrc    ViConstString
export const ViConstRsrc = ViConstString;
// ViPRsrc        ViString
// ViARsrc        ViRsrc[]
// ViStatus       ViInt32
export const ViStatus = ViInt32;
// ViPStatus      ViStatus *
// ViAStatus      ViStatus[]
// ViVersion      ViUInt32
// ViPVersion     ViVersion *
// ViAVersion     ViVersion[]
// ViObject       ViUInt32
export const ViObject = ViUInt32;
// ViPObject      ViObject *
// ViAObject      ViObject[]
// ViSession      ViObject
export const ViSession = ViObject;
// ViPSession     ViSession *
export const ViPSession = koffi.pointer(ViSession);
// ViASession     ViSession[]
// ViAttr         ViUInt32

// ViAccessMode     ViUInt32
export const ViAccessMode = ViUInt32;
// ViPAccessMode    ViAccessMode *
// ViBusAddress     ViUInt32 or ViUInt64
// ViBusAddress64   ViUInt64
// ViPBusAddress    ViBusAddress *
// ViPBusAddress64  ViBusAddress64 *
// ViBusSize        ViUInt32 or ViUInt64
// ViAttrState      ViUInt32 or ViUInt64
// ViPAttrState     void *
// ViVAList         va_list
// ViEventType      ViUInt32
// ViPEventType     ViEventType *
// ViAEventType     ViEventType *
// ViPAttr          ViAttr *
// ViAAttr          ViAttr *
// ViEventFilter    ViUInt32
// ViFindList       ViObject
export const ViFindList = ViObject;
// ViPFindList      ViFindList *
export const ViPFindList = koffi.pointer(ViFindList);
// ViEvent          ViObject
// ViPEvent         ViEvent *
// ViKeyId          ViString
