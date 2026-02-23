import { useState } from 'react';
import {
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  VStack,
  Card,
  CardBody,
  CardHeader,
  Text,
  Tag,
} from '@chakra-ui/react';
import { calculateBond } from './api';
import type { BondCalculationResult, CalculateBondRequest, CouponFrequency } from './types';

const initialValues: CalculateBondRequest = {
  faceValue: 1000,
  annualCouponRate: 5,
  marketPrice: 1000,
  yearsToMaturity: 5,
  couponFrequency: 'semi-annual',
};

function formatPct(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function App() {
  const [form, setForm] = useState<CalculateBondRequest>(initialValues);
  const [result, setResult] = useState<BondCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = (field: keyof CalculateBondRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const raw = e.target.value;
    const value =
      field === 'couponFrequency'
        ? (raw as CouponFrequency)
        : Number(raw);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const data = await calculateBond(form);
      setResult(data);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Calculation failed',
        status: 'error',
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack align="stretch" spacing={8}>
        <Heading size="lg">Bond Yield Calculator</Heading>

        <Card>
          <CardHeader>
            <Text fontWeight="semibold">Inputs</Text>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={4}>
                <FormControl isRequired>
                  <FormLabel>Face Value ($)</FormLabel>
                  <Input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={form.faceValue}
                    onChange={handleChange('faceValue')}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Annual Coupon Rate (%)</FormLabel>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={form.annualCouponRate}
                    onChange={handleChange('annualCouponRate')}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Market Price ($)</FormLabel>
                  <Input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={form.marketPrice}
                    onChange={handleChange('marketPrice')}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Years to Maturity</FormLabel>
                  <Input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={form.yearsToMaturity}
                    onChange={handleChange('yearsToMaturity')}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Coupon Frequency</FormLabel>
                  <Select
                    value={form.couponFrequency}
                    onChange={handleChange('couponFrequency')}
                  >
                    <option value="annual">Annual</option>
                    <option value="semi-annual">Semi-annual</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
              <Button type="submit" colorScheme="blue" isLoading={loading}>
                Calculate
              </Button>
            </form>
          </CardBody>
        </Card>

        {result && (
          <>
            <Card>
              <CardHeader>
                <Text fontWeight="semibold">Outputs</Text>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
                  <Stat>
                    <StatLabel>Current Yield</StatLabel>
                    <StatNumber>{formatPct(result.currentYield)}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Yield to Maturity</StatLabel>
                    <StatNumber>{formatPct(result.yieldToMaturity)}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Total Interest Earned</StatLabel>
                    <StatNumber>
                      {formatMoney(result.totalInterestEarned)}
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Premium / Discount</StatLabel>
                    <StatNumber>
                      <Tag
                        colorScheme={
                          result.premiumDiscount === 'premium'
                            ? 'green'
                            : result.premiumDiscount === 'discount'
                              ? 'orange'
                              : 'gray'
                        }
                      >
                        {result.premiumDiscount}
                      </Tag>
                    </StatNumber>
                  </Stat>
                </SimpleGrid>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Text fontWeight="semibold">Cash Flow Schedule</Text>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table size="sm" variant="striped">
                    <Thead>
                      <Tr>
                        <Th>Period</Th>
                        <Th>Payment Date</Th>
                        <Th isNumeric>Coupon Payment</Th>
                        <Th isNumeric>Cumulative Interest</Th>
                        <Th isNumeric>Remaining Principal</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {result.cashFlowSchedule.map((row) => (
                        <Tr key={row.period}>
                          <Td>{row.period}</Td>
                          <Td>{row.paymentDate}</Td>
                          <Td isNumeric>{formatMoney(row.couponPayment)}</Td>
                          <Td isNumeric>
                            {formatMoney(row.cumulativeInterest)}
                          </Td>
                          <Td isNumeric>
                            {formatMoney(row.remainingPrincipal)}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </>
        )}
      </VStack>
    </Container>
  );
}
