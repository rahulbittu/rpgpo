# Subtask Output — Research Weather Stations
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Finding 1: Davis Vantage Vue Features and Capabilities
- **Core sensors**: Includes temperature, humidity, barometric pressure, wind speed/direction, rainfall; no built-in **soil moisture sensor** or **UV index** tracking in standard ISS (Instrument Shelter Suite)[1][2].
- **Smart home integration**: Compatible with WeeWX software for publishing to services like Weather Underground, CWOP, PWSweather, Windy; supports Davis Envoy for IP connectivity and potential API integrations[1].
- **Recent update**: Price increase on complete stations and sensor suites effective January 15, 2026[4].
- **Status example**: Real-time monitoring shows 100% ISS packet reception, console battery at 4.7V[2].
Source: https://pypi.org/project/weewx/[1]; https://www.corderaweather.com/wxstatus.php[2]; https://cirruslyweather.com/blog/[4]

## Finding 2: Ambient Weather WS-5000 Features and Capabilities
- No specific details found in results on **soil moisture sensors**, **UV index tracking**, or **smart home integration** for WS-5000; noted as compatible variant of Fine Offset WH10xx/WH20xx/WH30xx series with WeeWX for data services like Weather Underground[1].
- Lacks direct mentions of queried features in available data.
Source: https://pypi.org/project/weewx/[1]

## Finding 3: Ecowitt HP2560 Features and Capabilities
- No specific details found in results on **soil moisture sensors**, **UV index tracking**, or **smart home integration** for HP2560; noted as compatible with Fine Offset GW1000/GW1100/GW2000 series (including Ecowitt) via WeeWX for online weather services[1].
- Lacks direct mentions of queried features in available data.
Source: https://pypi.org/project/weewx/[1]

**Note on search limitations**: Results from March 2026 focus heavily on WeeWX compatibility but lack manufacturer spec sheets for soil moisture (typically optional add-ons for Davis/Ecowitt), UV (standard on some Davis Pro2 but not confirmed for Vue), or integrations like Alexa/Google Home (common for Ecowitt/Ambient per prior knowledge, unconfirmed here). Recommend checking official sites: davisinstruments.com, ambientweather.com, ecowitt.com for latest specs. No data from last 30 days on these exact features.
