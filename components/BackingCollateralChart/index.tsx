import { ResponsivePie } from '@nivo/pie'

interface BackingPieProps {
  data?: any[]
}

export const BackingPie = ({ data }: BackingPieProps) => (
  <ResponsivePie
    data={data ?? mocData}
    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
    innerRadius={0.5}
    padAngle={0.7}
    cornerRadius={3}
    activeOuterRadiusOffset={8}
    borderWidth={1}
    borderColor={{
      from: 'color',
      modifiers: [['darker', 0.2]],
    }}
    arcLinkLabelsSkipAngle={10}
    arcLinkLabelsTextColor="#999"
    arcLinkLabelsThickness={2}
    arcLinkLabelsColor={{ from: 'color' }}
    arcLabelsSkipAngle={10}
    arcLabelsTextColor={{
      from: 'color',
      modifiers: [['darker', 2]],
    }}
    theme={{
      tooltip: {
        container: {
          background: '#333',
          color: '#fff',
        },
      },
    }}
  />
)

const mocData = [
  {
    id: 'ETH',
    label: 'ETH',
    value: 218.5,
    color: 'hsl(228, 70%, 50%)',
  },
  {
    id: 'BTC',
    label: 'BTC',
    value: 259.3,
    color: 'hsl(160, 70%, 50%)',
  },
  {
    id: 'USDT',
    label: 'USDT',
    value: 443.0,
    color: 'hsl(165, 70%, 50%)',
  },
  {
    id: 'USDC',
    label: 'USDC',
    value: 526.0,
    color: 'hsl(303, 70%, 50%)',
  },
]
