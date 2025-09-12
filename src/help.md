## Introduction

Hello and welcome to the `bonsai-zero-a-1-k` documentation. A few words about numbers and letters in the project name:
- `zero` means that it's the most basic model in the bonsai family.
- `a` stands for the sensor type, analog in this case.
- `1` describes the number of sensors used.
- `k` is for "Kit", which means that each part of the device (sensor, DevKit, enclosure) is replaceable.

The documentation covers the steps you need to do to setup the working system. Let's get started!

## Assembly

The first step is to properly connect everything:
- Connect the ESP32 DevKit to the two parallel shields on the module.
- Connect the module to the enclosure using M2 screws (8mm long).
- Connect the soil moisture sensor (3v3) to the JST-XH (2.5 mm pitch) connector.
- Connect the micro USB to the ESP32 DevKit.
- Power up the device.

## WiFi Access Point Configuration

Once the device has been powered up, the next step is to connect to the device's Web GUI, which will later be used to configure other parts of the system. Web GUI can be accessed when your phone (or laptop) and `bonsai-zero-a-1-k` are connected to the same WiFi network. `bonsai-zero-a-1-k` can operate as both a WiFi access point (AP) and a WiFi station (STA). The WiFi AP mode is used by default. Let's connect to the `bonsai-zero-a-1-k` WiFi AP:

- Power up the device, and open the WiFi Settings on your phone (or laptop), you should see the new WiFi AP with SSID (name) similar to "bonsai-123456ABCDEF10202", where the "bonsai" is the product name, and "123456ABCDEF10202" are the unique symbols for each device (device ID).

- Try to connect to the WiFi AP, you will be prompted to enter the password. The password is the product name followed by the first twelve characters of the device ID. For the example, for the "bonsai-123456ABCDEF10202" WiFi SSID, the password would be "bonsai-123456ABCDEF".

- Once connected, try to accesse the Web GUI, by entering `bonsai-zero-a-1-k.local` into your web browser.

**SECURITY WARNING**

It is highly recommended to update the default WiFi password to a more secure one.

## mDNS Configuration

Recently it was mentioned, that we can access the device by entering `bonsai-zero-a-1-k.local` into a web browser. This means that we don't need to know the exact IP address of the device, which can change over time. All this works thanks to the mDNS support builtin in the firmware. It's possible to change the default mDNS hostname, `bonsai-zero-a-1-k`, to something more memorable, for example, `room-1-zamiokulkas`, and after that the device will be rebooted and you will be able to access it by entering `room-1-zamiokulkas.local` into your web browser.

## WiFi Station Configuration

mDNS allows to access devices connected to the same local network. This means that, each time you want to access the `bonsai-zero-a-1-k` device, you first need to connect to its WiFi AP. This can be inconvenient in some cases. `bonsai-zero-a-1-k` can be connected to another WiFi router, for example, to your home router. After that you connect to your home WiFi as usual and still be able to access `bonsai-zero-a-1-k`.

**SECURITY WARNING**

WiFi credentials are passed as plain text via the HTTP request, meaning that a man-in-the-middle attack is possible. Just be aware of it, even if it won't be the case for most home setups.

## Soil Sensor Configuration

On this step WiFi network is properly configured and it's time to configure the soil moisture sensor.

- In the Web GUI click on the Soil Moisture card, the configuration menu should be opened.
- Click on the "Configure" button, you should see "Min", "Max", "Oversampling" options.
- Keep sensor in the air and check the "Raw Value" in the sensor card, it's your "Max" value.
- Put sensor into the water and check the "Raw Value" again, it's your "Min" value.
- "Oversampling" refers to the number of times a value is measured before being returned to the outside world. Allowed values: 1, 8, 16, 32, 64. The larger the number, the more accurate the measurement.
- Enter values into the corresponding fields and click the "Save" button.
- Your sensor is now configured.

## Device Hub Configuration

[device-hub](https://github.com/tendry-lab/device-hub) is another Tendry Lab project that can be used together with `bonsai-zero-a-1-k` device. It periodically fetches the data from the device and stores it in the persistent storage for further advanced analysis. There is no need to manually add the `bonsai-zero-a-1-k` to the `device-hub`, just ensure that they are connected to the same WiFi network. Then enter `device-hub.local/api/v1/device/list` into your web browser, and check if the `bonsai-zero-a-1-k` is present in the list of registered devices. For more information, see the detailed device-hub [documentation](https://github.com/tendry-lab/device-hub/tree/master/docs/install/rpi).
